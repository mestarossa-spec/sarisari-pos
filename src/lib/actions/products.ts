"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const price = parseFloat(formData.get("price") as string);
  const stockQuantity = parseInt(formData.get("stockQuantity") as string, 10);
  const lowStockThreshold = parseInt(
    formData.get("lowStockThreshold") as string,
    10
  );

  await prisma.product.create({
    data: { name, unit, price, stockQuantity, lowStockThreshold },
  });

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const price = parseFloat(formData.get("price") as string);
  const stockQuantity = parseInt(formData.get("stockQuantity") as string, 10);
  const lowStockThreshold = parseInt(
    formData.get("lowStockThreshold") as string,
    10
  );

  await prisma.product.update({
    where: { id },
    data: { name, unit, price, stockQuantity, lowStockThreshold },
  });

  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
}