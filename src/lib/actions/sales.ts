"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CartItem = { productId: number; quantity: number };

export async function createSale(
  items: CartItem[],
  paymentMethod: "CASH" | "GCASH"
): Promise<{ success: true } | { success: false; error: string }> {
  if (items.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const saleItemsData: {
        productId: number;
        quantity: number;
        unitPriceSnapshot: number;
        subtotal: number;
      }[] = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found (id: ${item.productId}).`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(
            `Not enough stock for "${product.name}". Available: ${product.stockQuantity}, requested: ${item.quantity}.`
          );
        }

        const unitPrice = Number(product.price);
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;

        saleItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPriceSnapshot: unitPrice,
          subtotal,
        });

        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      await tx.sale.create({
        data: {
          totalAmount,
          paymentMethod,
          items: { create: saleItemsData },
        },
      });
    });

    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred.",
    };
  }
}