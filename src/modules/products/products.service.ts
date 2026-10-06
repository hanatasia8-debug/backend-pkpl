import { ProductsRepository } from "./products.repository";
import { FindAllProductsParams, CreateProductDTO, UpdateProductDTO, findAllProductsSchema, createProductSchema, updateProductSchema } from "./products.schema";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";
import { formatWhatsAppNumber, createWhatsAppLink } from "../../shared/utils/whatsapp";
import { IndexingService } from "../indexing/indexing.service";

export class ProductsService {
  static async getAllProducts(params: unknown) {
    const validation = findAllProductsSchema.safeParse(params);
    if (!validation.success) {
      throw new ValidationError("Parameter pencarian produk tidak valid", validation.error.flatten());
    }

    return ProductsRepository.findAllPaginated(validation.data);
  }

  static async getProductById(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID produk tidak valid");
    }

    const product = await ProductsRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Produk dengan ID '${idStr}' tidak ditemukan`);
    }

    const waTemplate = `Halo ${product.umkm.name}, saya melihat produk "${product.name}" di platform LokalUMKM Pringgodani dan tertarik untuk memesan / menanyakan info lebih lanjut.`;
    const whatsappLink = createWhatsAppLink(product.umkm.phone, waTemplate);

    return {
      ...product,
      umkm: {
        ...product.umkm,
        whatsappFormatted: formatWhatsAppNumber(product.umkm.phone),
        whatsappLink,
      },
    };
  }

  static async createProduct(input: unknown) {
    const validation = createProductSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError("Data produk tidak valid", validation.error.flatten());
    }

    const data: CreateProductDTO = validation.data;
    let umkmId: bigint;
    try {
      umkmId = BigInt(data.umkmId);
    } catch {
      throw new ValidationError("ID UMKM tidak valid");
    }

    const created = await ProductsRepository.createProduct({
      umkmId,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
    });

    const result = {
      id: created.id.toString(),
      name: created.name,
      description: created.description,
      price: created.price ? Number(created.price) : null,
      imageUrl: created.imageUrl,
    };

    if (result.id) {
      IndexingService.notifyProductUpdated(result.id);
    }

    return result;
  }

  static async updateProduct(idStr: string, input: unknown) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID produk tidak valid");
    }

    const validation = updateProductSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError("Data pembaruan produk tidak valid", validation.error.flatten());
    }

    const updated = await ProductsRepository.updateProduct(id, validation.data);
    const result = {
      id: updated.id.toString(),
      name: updated.name,
      description: updated.description,
      price: updated.price ? Number(updated.price) : null,
      imageUrl: updated.imageUrl,
    };

    if (result.id) {
      IndexingService.notifyProductUpdated(result.id);
    }

    return result;
  }

  static async deleteProduct(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID produk tidak valid");
    }

    await ProductsRepository.deleteProduct(id);
    IndexingService.notifyProductDeleted(idStr);
    return { success: true, message: "Produk berhasil dihapus" };
  }
}

