import { NewsRepository, FindAllNewsParams } from "./news.repository";
import { CreateNewsDTO, UpdateNewsDTO, baseCreateNewsSchema, updateNewsSchema } from "./news.schema";
import { generateNewsTypeSlug, generateNewsSlug, generateNewsCategorySlug } from "../../shared/utils/slug";
import { ValidationError, NotFoundError } from "../../shared/errors/app-error";
import { prisma } from "../../shared/db/client";
import { IndexingService } from "../indexing/indexing.service";

export class NewsService {
  static async getCategories(includeAll = false) {
    const categories = await NewsRepository.findAllCategories(includeAll);
    return { items: categories };
  }

  static async createCategory(data: { name: string; description?: string }) {
    if (!data.name || !data.name.trim()) {
      throw new ValidationError("Nama kategori berita wajib diisi");
    }
    const cleanName = data.name.trim();
    const existing = await NewsRepository.findCategoryByName(cleanName);
    if (existing) {
      return {
        id: existing.id.toString(),
        name: existing.name,
        slug: existing.slug,
        description: existing.description,
      };
    }
    const slug = await generateNewsCategorySlug(cleanName);
    const created = await NewsRepository.createCategory({
      name: cleanName,
      slug,
      description: data.description?.trim() || null,
    });
    return {
      id: created.id.toString(),
      name: created.name,
      slug: created.slug,
      description: created.description,
    };
  }

  static async getTypes() {
    return NewsRepository.findAllTypes();
  }

  static async getAllNews(params: FindAllNewsParams = {}) {
    return NewsRepository.findAllPaginated(params);
  }

  static async getNewsBySlug(slug: string, requirePublished = true) {
    const news = await NewsRepository.findBySlug(slug);
    if (!news) {
      throw new NotFoundError(`Berita dengan slug '${slug}' tidak ditemukan`);
    }
    if (requirePublished && !["PUBLISHED", "published", "Published"].includes(news.status)) {
      throw new NotFoundError(`Berita '${slug}' tidak ditemukan atau belum dipublikasikan`);
    }
    return news;
  }

  static async getNewsById(idStr: string) {
    const news = await NewsRepository.findById(idStr);
    if (!news) {
      throw new NotFoundError(`Berita dengan ID '${idStr}' tidak ditemukan`);
    }
    return news;
  }

  static async deleteNews(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID berita tidak valid");
    }

    const existing = await NewsRepository.findById(idStr).catch(() => null);
    const deleted = await NewsRepository.deleteNews(id);

    if (existing?.slug) {
      IndexingService.notifyNewsDeleted(existing.slug);
    }

    return deleted;
  }

  static async createNews(input: unknown) {
    const validation = baseCreateNewsSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0].message,
        validation.error.flatten()
      );
    }

    const data: CreateNewsDTO = validation.data;

    const result = await NewsRepository.executeTransaction(async (tx) => {
      // 1. Handle Category
      let finalCategoryId: bigint;
      if (data.newsCategoryId === "other") {
        const cleanedCatName = (data.newCategoryName || "Kabar UMKM").trim();
        const existingCat = await NewsRepository.findCategoryByName(cleanedCatName, tx);
        if (existingCat) {
          finalCategoryId = existingCat.id;
        } else {
          const catSlug = await generateNewsCategorySlug(cleanedCatName, tx);
          const newCat = await NewsRepository.createCategory({ name: cleanedCatName, slug: catSlug }, tx);
          finalCategoryId = newCat.id;
        }
      } else if (!isNaN(Number(data.newsCategoryId))) {
        const catId = BigInt(data.newsCategoryId);
        const existing = await tx.newsCategory.findUnique({ where: { id: catId } });
        if (existing) {
          finalCategoryId = existing.id;
        } else {
          const defaultCat = await tx.newsCategory.findFirst();
          if (defaultCat) {
            finalCategoryId = defaultCat.id;
          } else {
            const created = await tx.newsCategory.create({
              data: { name: "Umum", slug: "umum" },
            });
            finalCategoryId = created.id;
          }
        }
      } else {
        const searchSlug = data.newsCategoryId.toLowerCase().trim();
        let cat = await tx.newsCategory.findFirst({
          where: {
            OR: [
              { slug: searchSlug },
              { name: { equals: data.newsCategoryId.trim(), mode: "insensitive" } },
            ],
          },
        });
        if (!cat) {
          const catSlug = await generateNewsCategorySlug(data.newsCategoryId, tx);
          cat = await tx.newsCategory.create({
            data: { name: data.newsCategoryId, slug: catSlug },
          });
        }
        finalCategoryId = cat.id;
      }

      // 2. Handle Type
      let finalTypeId: bigint;
      if (data.newsTypeId === "other") {
        const cleanedTypeName = (data.newTypeName || "Artikel").trim();
        const existingType = await NewsRepository.findTypeByName(cleanedTypeName, tx);
        if (existingType) {
          finalTypeId = existingType.id;
        } else {
          const typeSlug = await generateNewsTypeSlug(cleanedTypeName, tx);
          const newType = await NewsRepository.createType(
            { name: cleanedTypeName, slug: typeSlug },
            tx
          );
          finalTypeId = newType.id;
        }
      } else if (!isNaN(Number(data.newsTypeId))) {
        const tId = BigInt(data.newsTypeId);
        const existing = await tx.newsType.findUnique({ where: { id: tId } });
        if (existing) {
          finalTypeId = existing.id;
        } else {
          const firstType = await tx.newsType.findFirst();
          finalTypeId = firstType ? firstType.id : BigInt(1);
        }
      } else {
        const targetSlug = data.newsTypeId.toLowerCase().trim();
        let existingType = await tx.newsType.findFirst({
          where: {
            OR: [
              { slug: targetSlug },
              { name: { equals: data.newsTypeId.trim(), mode: "insensitive" } },
            ],
          },
        });
        if (existingType) {
          finalTypeId = existingType.id;
        } else {
          const typeName =
            data.newsTypeId === "STANDARD"
              ? "Artikel"
              : data.newsTypeId === "GALLERY"
              ? "Galeri"
              : data.newsTypeId;
          const typeSlug = await generateNewsTypeSlug(data.newsTypeId, tx);
          const newType = await tx.newsType.create({
            data: { name: typeName, slug: typeSlug },
          });
          finalTypeId = newType.id;
        }
      }

      const slug = await generateNewsSlug(data.title, tx);

      // 3. Create News record
      const excerpt =
        data.excerpt?.trim() ||
        (data.blocks?.find((b) => b.content?.trim())?.content?.slice(0, 160) || data.title);

      const news = await tx.news.create({
        data: {
          title: data.title,
          slug,
          newsCategoryId: finalCategoryId,
          newsTypeId: finalTypeId,
          excerpt,
          coverUrl: data.coverUrl || null,
          status: data.status || "PENDING",
          publishedAt: data.publishedAt || new Date(),
        },
      });

      // 5. Create ArticleDetail & Blocks for valid blocks
      const validBlocks = (data.blocks || []).filter(
        (b) => b && b.content && b.content.trim().length > 0
      );
      if (validBlocks.length > 0) {
        const articleDetail = await tx.articleDetail.create({
          data: {
            newsId: news.id,
          },
        });

        await tx.articleBlock.createMany({
          data: validBlocks.map((block, idx) => ({
            articleDetailId: articleDetail.id,
            subHeading: block.subHeading || null,
            content: block.content!.trim(),
            imageUrl: block.imageUrl || null,
            sortOrder: block.sortOrder ?? idx + 1,
          })),
        });
      }

      // 6. Create GalleryDetail & Images for valid galleryImages
      const validGallery = (data.galleryImages || []).filter(
        (img) => img && img.imageUrl && img.imageUrl.trim().length > 0
      );
      if (validGallery.length > 0) {
        const galleryDetail = await tx.galleryDetail.create({
          data: {
            newsId: news.id,
          },
        });

        await tx.galleryImage.createMany({
          data: validGallery.map((img, idx) => ({
            galleryDetailId: galleryDetail.id,
            imageUrl: img.imageUrl!.trim(),
            imageDescription: img.imageDescription || null,
            sortOrder: img.sortOrder ?? idx + 1,
          })),
        });
      }

      // 7. Tagged Many-to-Many Relations
      if (data.taggedUmkmIds && data.taggedUmkmIds.length > 0) {
        await tx.newsUmkm.createMany({
          data: data.taggedUmkmIds.map((uId) => ({
            newsId: news.id,
            umkmId: BigInt(uId),
          })),
          skipDuplicates: true,
        });
      }

      if (data.taggedProductIds && data.taggedProductIds.length > 0) {
        await tx.newsProduct.createMany({
          data: data.taggedProductIds.map((pId) => ({
            newsId: news.id,
            productId: BigInt(pId),
          })),
          skipDuplicates: true,
        });
      }

      return {
        id: news.id.toString(),
        slug: news.slug,
        title: news.title,
        status: news.status,
      };
    });

    if (result?.status === "PUBLISHED" && result?.slug) {
      IndexingService.notifyNewsUpdated(result.slug);
    }

    return result;
  }

  static async updateNews(idStr: string, input: unknown) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID berita tidak valid");
    }

    const validation = updateNewsSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError("Data pembaruan berita tidak valid", validation.error.flatten());
    }

    const payload = validation.data;

    const result = await NewsRepository.executeTransaction(async (tx) => {
      const existing = await tx.news.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError(`Berita dengan ID '${idStr}' tidak ditemukan`);
      }

      const updateData: any = {};
      if (payload.title) updateData.title = payload.title;
      if (payload.excerpt) updateData.excerpt = payload.excerpt;
      if (payload.coverUrl !== undefined) updateData.coverUrl = payload.coverUrl;
      if (payload.status) {
        updateData.status = payload.status.toUpperCase();
        if (updateData.status === "PUBLISHED") {
          updateData.publishedAt = existing.publishedAt || new Date();
          updateData.rejectionReason = null;
        } else if (updateData.status === "DRAFT" || updateData.status === "PENDING") {
          updateData.rejectionReason = null;
        }
      }
      if (payload.publishedAt) updateData.publishedAt = payload.publishedAt;
      if (payload.newsCategoryId === "other" && payload.newCategoryName && payload.newCategoryName.trim()) {
        const cleanedCatName = payload.newCategoryName.trim();
        const existingCat = await NewsRepository.findCategoryByName(cleanedCatName, tx);
        if (existingCat) {
          updateData.newsCategoryId = existingCat.id;
        } else {
          const catSlug = await generateNewsCategorySlug(cleanedCatName, tx);
          const newCat = await NewsRepository.createCategory(
            { name: cleanedCatName, slug: catSlug },
            tx
          );
          updateData.newsCategoryId = newCat.id;
        }
      } else if (payload.newsCategoryId && payload.newsCategoryId !== "other") {
        if (!isNaN(Number(payload.newsCategoryId))) {
          updateData.newsCategoryId = BigInt(payload.newsCategoryId);
        } else {
          const searchSlug = payload.newsCategoryId.toLowerCase().trim();
          let cat = await tx.newsCategory.findFirst({
            where: {
              OR: [
                { slug: searchSlug },
                { name: { equals: payload.newsCategoryId.trim(), mode: "insensitive" } },
              ],
            },
          });
          if (cat) {
            updateData.newsCategoryId = cat.id;
          }
        }
      }
      if (payload.newsTypeId && !isNaN(Number(payload.newsTypeId))) {
        updateData.newsTypeId = BigInt(payload.newsTypeId);
      }

      const updated = await tx.news.update({
        where: { id },
        data: updateData,
      });

      // Update blocks
      if (payload.blocks) {
        let art = await tx.articleDetail.findUnique({ where: { newsId: id } });
        if (!art) {
          art = await tx.articleDetail.create({ data: { newsId: id } });
        } else {
          await tx.articleBlock.deleteMany({ where: { articleDetailId: art.id } });
        }

        const validBlocks = payload.blocks.filter(
          (b) => b && b.content && b.content.trim().length > 0
        );
        if (validBlocks.length > 0) {
          await tx.articleBlock.createMany({
            data: validBlocks.map((block, idx) => ({
              articleDetailId: art.id,
              subHeading: block.subHeading || null,
              content: block.content!.trim(),
              imageUrl: block.imageUrl || null,
              sortOrder: block.sortOrder ?? idx + 1,
            })),
          });
        }
      }

      // Update galleryImages
      if (payload.galleryImages) {
        let gal = await tx.galleryDetail.findUnique({ where: { newsId: id } });
        if (!gal) {
          gal = await tx.galleryDetail.create({ data: { newsId: id } });
        } else {
          await tx.galleryImage.deleteMany({ where: { galleryDetailId: gal.id } });
        }

        const validGallery = payload.galleryImages.filter(
          (img) => img && img.imageUrl && img.imageUrl.trim().length > 0
        );
        if (validGallery.length > 0) {
          await tx.galleryImage.createMany({
            data: validGallery.map((img, idx) => ({
              galleryDetailId: gal.id,
              imageUrl: img.imageUrl!.trim(),
              imageDescription: img.imageDescription || null,
              sortOrder: img.sortOrder ?? idx + 1,
            })),
          });
        }
      }

      // Update tagged relations
      if (payload.taggedUmkmIds) {
        await tx.newsUmkm.deleteMany({ where: { newsId: id } });
        if (payload.taggedUmkmIds.length > 0) {
          await tx.newsUmkm.createMany({
            data: payload.taggedUmkmIds.map((uId) => ({
              newsId: id,
              umkmId: BigInt(uId),
            })),
            skipDuplicates: true,
          });
        }
      }

      if (payload.taggedProductIds) {
        await tx.newsProduct.deleteMany({ where: { newsId: id } });
        if (payload.taggedProductIds.length > 0) {
          await tx.newsProduct.createMany({
            data: payload.taggedProductIds.map((pId) => ({
              newsId: id,
              productId: BigInt(pId),
            })),
            skipDuplicates: true,
          });
        }
      }

      return {
        id: updated.id.toString(),
        slug: updated.slug,
        title: updated.title,
        status: updated.status,
      };
    });

    if (result?.status === "PUBLISHED" && result?.slug) {
      IndexingService.notifyNewsUpdated(result.slug);
    }

    return result;
  }
}
