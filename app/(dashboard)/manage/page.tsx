"use client";

import CreateCategoryDialog from "@/app/(dashboard)/_components/CreateCategoryDialog";
import DeleteCategoryDialog from "@/app/(dashboard)/_components/DeleteCategoryDialog";
import CreateBrandDialog from "@/app/(dashboard)/_components/CreateBrandDialog";
import DeleteBrandDialog from "@/app/(dashboard)/_components/DeleteBrandDialog";
import CreateClientDialog from "@/app/(dashboard)/_components/CreateClientDialog";
import DeleteClientDialog from "@/app/(dashboard)/_components/DeleteClientDialog";

// import CreateIngredientDialog from "@/app/(dashboard)/_components/CreateIngredientDialog";
// import DeleteIngredientDialog from "@/app/(dashboard)/_components/DeleteIngredientDialog";
import { WeightComboBox } from "@/components/WeightComboBox";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Category, Product } from "@prisma/client";
// import { Ingredient } from "@prisma/client";
import { Brand } from "@prisma/client";
import { Client } from "@prisma/client";

import { useQuery } from "@tanstack/react-query";
//START needed for deleting product 
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteProduct } from "@/app/(dashboard)/inventory/_actions/deleteProduct";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { ReactNode, useState } from "react";
//END
import { PlusSquare, TrashIcon, TrendingDown, TrendingUp } from "lucide-react";
import { CreateProduct } from "../_actions/new-products";
// import CreateProductDialog from "../_components/CreateProductDialog";
import CreateProductDialog from "@/app/(dashboard)/_components/CreateProductDialog";
// import DeleteProductDialog from "@/app/(dashboard)/_components/DeleteBrandDialog";
// import DeleteProductDialog from "@/app/(dashboard)/inventory/_components/DeleteProductDialog";
//needed for deleting product (see DeleteProductDialog in dashboard/_components)
interface Props {
  trigger: ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  productId: string;
}
function DeleteProductDialog({ productId, trigger }: Props) {
  // const productIdentifier = `${product.product}`;
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteProduct,
    onSuccess: async () => {
      toast.success("Product deleted successfully", {
        id: productId,
      });

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: productId,
      });
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            product
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting product...", {
                id: productId,
              });
              deleteMutation.mutate(productId);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function page() {
  return (
    <>
      {/* HEADER */}
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-3xl font-bold">Manage</p>
            <p className="text-muted-foreground">
              Manage your account settings and categories
            </p>
          </div>
        </div>
      </div>
      {/* END HEADER */}
      <div className="container flex flex-col gap-4 p-4">
        <ClientList  />
        <CategoryList  />
        <BrandList  />
      </div>
    </>
  );
}

export default page;

function CategoryList() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      fetch(`/api/categories`).then((res) => res.json()),
  });

  const dataAvailable = categoriesQuery.data && categoriesQuery.data.length > 0;

  return (
    <SkeletonWrapper isLoading={categoriesQuery.isLoading}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
             
              <div>
                 Categories
                <div className="text-sm text-muted-foreground">
                  Sorted by name
                </div>
              </div>
            </div>

            <CreateCategoryDialog
            
              successCallback={() => categoriesQuery.refetch()}
              trigger={
                <Button className="gap-2 text-sm">
                  <PlusSquare className="h-4 w-4" />
                  Create Category
                </Button>
              }
            />
          </CardTitle>
        </CardHeader>
        <Separator />
        {!dataAvailable && (
          <div className="flex h-40 w-full flex-col items-center justify-center">
            <p>
              No
              <span
                className={cn(
                  "m-1",
                 "text-emerald-500" 
                )}
              >
              
              </span>
              Categories yet
            </p>

            <p className="text-sm text-muted-foreground">
              Create one to get started
            </p>
          </div>
        )}
        {dataAvailable && (
          <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categoriesQuery.data.map((category: Category) => (
              <CategoryCard category={category} key={category.name} />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]">
      <div className="flex flex-col items-center gap-2 p-4">
        {/* <span className="text-3xl" role="img">
          {category.icon}
        </span> */}
        <span>{category.name}</span>
      </div>
      <DeleteCategoryDialog
        category={category}
        trigger={
          <Button
            className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20"
            variant={"secondary"}
          >
            <TrashIcon className="h-4 w-4" />
            Remove
          </Button>
        }
      />
    </div>
  );
}

function BrandList() {
  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: () =>
      fetch(`/api/brands`).then((res) => res.json()),
  });

  const dataAvailable = brandsQuery.data && brandsQuery.data.length > 0;

  return (
    <SkeletonWrapper isLoading={brandsQuery.isLoading}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
             
              <div>
                Brands
                <div className="text-sm text-muted-foreground">
                  Sorted by name
                </div>
              </div>
            </div>

            <CreateBrandDialog
          
              successCallback={() => brandsQuery.refetch()}
              trigger={
                <Button className="gap-2 text-sm">
                  <PlusSquare className="h-4 w-4" />
                  Create Brand
                </Button>
              }
            />
          </CardTitle>
        </CardHeader>
        <Separator />
        {!dataAvailable && (
          <div className="flex h-40 w-full flex-col items-center justify-center">
            <p>
              No
              <span
                className={cn(
                  "m-1",
                "text-emerald-500" 
                )}
              >
                
              </span>
              Brands yet
            </p>

            <p className="text-sm text-muted-foreground">
              Create one to get started
            </p>
          </div>
        )}
        {dataAvailable && (
          <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {brandsQuery.data.map((brand: Brand) => (
              <BrandCard brand={brand} key={brand.name} />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]">
      <div className="flex flex-col items-center gap-2 p-4">
        <span>{brand.name}</span>
      </div>
      <DeleteBrandDialog
        brand={brand}
        trigger={
          <Button
            className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20"
            variant={"secondary"}
          >
            <TrashIcon className="h-4 w-4" />
            Remove
          </Button>
        }
      />
    </div>
  );
}
function ClientList() {
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      fetch(`/api/clients`).then((res) => res.json()),
  });

  const dataAvailable = clientsQuery.data && clientsQuery.data.length > 0;

  return (
    <SkeletonWrapper isLoading={clientsQuery.isLoading}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
             
              <div>
                Clients
                <div className="text-sm text-muted-foreground">
                  Sorted by name
                </div>
              </div>
            </div>

            <CreateClientDialog
          
              successCallback={() => clientsQuery.refetch()}
              trigger={
                <Button className="gap-2 text-sm">
                  <PlusSquare className="h-4 w-4" />
                  Create Client
                </Button>
              }
            />
          </CardTitle>
        </CardHeader>
        <Separator />
        {!dataAvailable && (
          <div className="flex h-40 w-full flex-col items-center justify-center">
            <p>
              No
              <span
                className={cn(
                  "m-1",
                "text-emerald-500" 
                )}
              >
                
              </span>
              Clients yet
            </p>

            <p className="text-sm text-muted-foreground">
              Create one to get started
            </p>
          </div>
        )}
        {dataAvailable && (
          <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {clientsQuery.data.map((client: Client) => (
              <ClientCard client={client} key={client.name} />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}

function ClientCard({ client }: { client: Client }) {
  return (
    <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]">
      <div className="flex flex-col items-center gap-2 p-4">
        {/* <span className="text-3xl" role="img">
          {brand.icon}
        </span> */}
        <span>{client.name}</span>
      </div>
      <DeleteClientDialog
        client={client}
        trigger={
          <Button
            className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20"
            variant={"secondary"}
          >
            <TrashIcon className="h-4 w-4" />
            Remove
          </Button>
        }
      />
    </div>
  );
}