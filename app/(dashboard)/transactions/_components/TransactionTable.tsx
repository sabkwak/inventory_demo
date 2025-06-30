"use client";
import { VisibilityState } from "@tanstack/react-table"; // Import the correct type

import { DateToUTCDate } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { GetTransactionHistoryResponseType } from "@/app/api/transactions-history/route";
import { useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { DataTableColumnHeader } from "@/components/datatable/ColumnHeader";
import { cn } from "@/lib/utils";
import { DataTableFacetedFilter } from "@/components/datatable/FacetedFilters";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "@/components/datatable/ColumnToggle";

import { download, generateCsv, mkConfig } from "export-to-csv";
import { DownloadIcon, MoreHorizontal, TrashIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteTransactionDialog from "@/app/(dashboard)/transactions/_components/DeleteTransactionDialog";
import EditTransactionDialog from "@/app/(dashboard)/transactions/_components/EditTransactionDialog";

import * as XLSX from "xlsx";

interface Props {
  from: Date;
  to: Date;
}

const emptyData: any[] = [];

type TransactionHistoryRow = GetTransactionHistoryResponseType[0];

const columns: ColumnDef<TransactionHistoryRow>[] = [
    {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ingredient" />
    ),
    filterFn: (row, id, value) => {
      const ingredientName = row.original.productName;
      return value.includes(ingredientName);
    },
    cell: ({ row }) => (
      <div className="flex gap-2">
        <div className="">{row.original.productName}</div>
      </div>
    ),
    enableHiding: false, // Ingredient is visible by default
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand" />
    ),
    filterFn: (row, id, value) => {
      const brandName = row.original.brandName;
      return value.includes(brandName);
    },
    cell: ({ row }) => (
      <div className="flex gap-2 capitalize">
        {row.original.brandName}
      </div>
    ),
    enableHiding: false, // Brand is visible by default
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
        {row.original.amount} {row.original.unitName ? row.original.unitName : ''}
      </p>
    ),
    enableHiding: false, // Amount is visible by default
  },


  {
  accessorKey: "cost",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Production Cost ($/unit)" />
  ),
  cell: ({ row }) => {
    const value = row.original.cost && typeof row.original.cost === 'object' && 'toNumber' in row.original.cost ? row.original.cost.toNumber() : row.original.cost;
    return (
      <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
        {value !== null && value !== undefined ? `$${value}` : "-"}
      </p>
    );
  },
  enableHiding: true,
},
  {
    accessorKey: "sellPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Selling Price ($/unit)" />
    ),
    cell: ({ row }) => {
      const value = row.original.sellPrice && typeof row.original.sellPrice === 'object' && 'toNumber' in row.original.sellPrice ? row.original.sellPrice.toNumber() : row.original.sellPrice;
      return (
        <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
          {value !== null && value !== undefined ? `$${value}` : "-"}
        </p>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "totalCost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Transaction Cost" />
    ),
    cell: ({ row }) => {
      const unitPrice = row.original.type === "add"
        ? (row.original.cost && typeof row.original.cost === 'object' && 'toNumber' in row.original.cost ? row.original.cost.toNumber() : row.original.cost)
        : (row.original.sellPrice && typeof row.original.sellPrice === 'object' && 'toNumber' in row.original.sellPrice ? row.original.sellPrice.toNumber() : row.original.sellPrice);
      return (
        <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
          {unitPrice !== null && unitPrice !== undefined ? `$${unitPrice * row.original.amount}` : "-"}
        </p>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description/Notes" />
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.original.description}</div>
    ),
    enableHiding: true, // Description is visible by default
  },
  
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Updated" />
    ),
    filterFn: (row, id, value) => {
      const date = row.original.date;
      return value.includes(date);
    },
    cell: ({ row }) => {
      // const date = new Date(row.original.date);
      // const formattedDate = date.toLocaleDateString("default", {
      //   timeZone: "PST",
      //   year: "numeric",
      //   month: "2-digit",
      //   day: "2-digit",
      // });
      const date = new Date(row.original.date);
      const pstOffset = +4; // For PST without daylight savings, use -8
      const pstDate = new Date(date.getTime() + pstOffset * 60 * 60 * 1000);

      const formattedDate = `${pstDate.toLocaleDateString("default", {
        timeZone: "PST",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })}`;
      return <div className="text-muted-foreground">{formattedDate}</div>;
    },
    enableHiding: true, // Date is hidden by default
  },

  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    filterFn: (row, id, value) => {
      const categoryName = row.original.categoryName;
      return value.includes(categoryName);
    },
    cell: ({ row }) => (
      <div className="flex gap-2 capitalize">
        {row.original.categoryName || "No Category"}
      </div>
    ),
    enableHiding: false, // Category is hidden by default
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    filterFn: (row, id, value) => {
      const typeName = row.original.type;
      return value.includes(typeName);
    },
    cell: ({ row }) => {
      const getTypeLabel = (type: string) => {
        switch (type) {
          case "add":
            return "Add";
          case "subtract":
            return "Subtract";
          case "sold":
            return "Sold";
          case "waste":
            return "Waste";
          default:
            return type;
        }
      };

      const getTypeStyle = (type: string) => {
        switch (type) {
          case "add":
            return "bg-emerald-400/10 text-emerald-500";
          case "subtract":
            return "bg-red-400/10 text-red-500";
          case "sold":
            return "bg-blue-400/10 text-blue-500";
          case "waste":
            return "bg-orange-400/10 text-orange-500";
          default:
            return "bg-gray-400/10 text-gray-500";
        }
      };

      return (
        <div
          className={cn(
            "capitalize rounded-lg text-center p-2",
            getTypeStyle(row.original.type)
          )}
        >
          {getTypeLabel(row.original.type)}
        </div>
      );
    },
    enableHiding: true, // Type is hidden by default
  },
  {
    id: "actions",
    enableHiding: false, // Actions column is hidden by default
    cell: ({ row }) => <RowActions transaction={row.original} />,
  },
];



const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

function toNumber(val: any) {
  return val && typeof val === 'object' && 'toNumber' in val ? val.toNumber() : val ?? 0;
}

function TransactionTable({ from, to }: Props) {
  // State to track if the component is rendering on the client
  const [isMounted, setIsMounted] = useState(false);

  // Detect when the component has mounted on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    if (typeof window !== "undefined") {
      const savedFilters = localStorage.getItem('transactionTableFilters');
      return savedFilters ? JSON.parse(savedFilters) : [];
    }
    return [];
  });


const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const history = useQuery<GetTransactionHistoryResponseType>({
    queryKey: ["transactions", "history", from, to],
    queryFn: () =>
      fetch(
        `/api/transactions-history?from=${DateToUTCDate(
          from
        )}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  });

  const handleExportCSV = (data: any[]) => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };
  const handleExportExcel = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    
    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (typeof window !== "undefined") {
      const savedVisibility = localStorage.getItem('transactionTableVisibility');
      return savedVisibility ? JSON.parse(savedVisibility) : {
        description: false, // Initially hidden
        date: false, // Initially hidden
        price: false,
        category: false,
        type: false,
      };
    }
    return {
      description: false, // Initially hidden
      date: false, // Initially hidden
      price: false,
      category: false,
      type: false,
    };
  });


 // Save filters and visibility state to localStorage on client side only
 useEffect(() => {
  if (isMounted) {
    localStorage.setItem('transactionTableFilters', JSON.stringify(columnFilters));
  }
}, [columnFilters, isMounted]);

useEffect(() => {
  if (isMounted) {
    localStorage.setItem('transactionTableVisibility', JSON.stringify(columnVisibility));
  }
}, [columnVisibility, isMounted]);

  const table = useReactTable({
    data: history.data || emptyData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility, // Include the column visibility state here
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
          pageSize: 25,
      },
    },
    onColumnVisibilityChange: setColumnVisibility, // Update visibility state based on changes
  });
  const categoriesOptions = useMemo(() => {
    const categoriesMap = new Map<string, { value: string; label: string }>();
    history.data?.forEach((transaction) => {
      const categoryName = transaction.categoryName || "No Category";
      categoriesMap.set(categoryName, {
        value: categoryName,
        label: `${categoryName}`,
      });
    });
    return Array.from(categoriesMap.values());
  }, [history.data]);

  const brandsOptions = useMemo(() => {
    const brandsMap = new Map();
    history.data?.forEach((transaction) => {
      brandsMap.set(transaction.brandName, {
        value: transaction.brandName,
        label: `${transaction.brandName}`,
      });
    });
    const uniqueBrands = new Set(brandsMap.values());
    return Array.from(uniqueBrands);
  }, [history.data]);
  const productsOptions = useMemo(() => {
    const productsMap = new Map<string, { value: string; label: string }>();
  
    history.data?.forEach((transaction) => {  // Explicitly type 'product'
      productsMap.set(transaction.productName, {
        value: transaction.productName,
        label: `${transaction.productName}`,
      });
    });
  
    return Array.from(productsMap.values());
  }, [history.data]);


    // Render a fallback (e.g., a loading state) while the component is hydrating
    if (!isMounted) {
      return <div>Loading...</div>;
    }
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-2 py-4">
        <div className="flex gap-2">
          {table.getColumn("category") && (
            <DataTableFacetedFilter
              title="Category"
              column={table.getColumn("category")}
              options={categoriesOptions}
            />
          )}
          {table.getColumn("brand") && (
            <DataTableFacetedFilter
              title="Brand"
              column={table.getColumn("brand")}
              options={brandsOptions}
            />
          )}
          {table.getColumn("product") && (
            <DataTableFacetedFilter
              title="Ingredient"
              column={table.getColumn("product")}
              options={productsOptions}
            />
          )}

          {table.getColumn("type") && (
            <DataTableFacetedFilter
              title="Type"
              column={table.getColumn("type")}
              options={[
                { label: "Add", value: "add" },
                { label: "Subtract", value: "subtract" },
                { label: "Sold", value: "sold" },
                { label: "Waste", value: "waste" },
              ]}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={"outline"}
            size={"sm"}
            className="ml-auto h-8 lg:flex"
            onClick={() => {
              const data = table.getFilteredRowModel().rows.map((row) => {
                // Format the date and time for Date_Ordered_or_Returned. Idk why it needs me to manually add the hours like this sorry :/
                const date = new Date(row.original.date);
                const pstOffset = +4; // For PST without daylight savings, use -8
                const pstDate = new Date(date.getTime() + pstOffset * 60 * 60 * 1000);

                const formattedDateTime = `${pstDate.toLocaleDateString("default", {
                  timeZone: "PST",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })} ${pstDate.toLocaleTimeString("default", {
                  timeZone: "PST",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true, // This keeps the AM/PM format; remove if you prefer 24-hour format

                })}`;
              
                return {
                  Amount: row.original.amount, // Assuming this is numeric, no formatting required
                  Ingredient: row.original.productName,
                  Brand: row.original.brandName,
                  Category: row.original.categoryName,
                  Description: row.original.description,
                  Date_Ordered_or_Returned: formattedDateTime, // Use the formatted date and time for export
                 Price: row.original.type === "add"
                   ? (row.original.cost && typeof row.original.cost === 'object' && 'toNumber' in row.original.cost ? row.original.cost.toNumber() : row.original.cost)
                   : (row.original.sellPrice && typeof row.original.sellPrice === 'object' && 'toNumber' in row.original.sellPrice ? row.original.sellPrice.toNumber() : row.original.sellPrice),
                  Type: row.original.type,                };
              });
              
              handleExportExcel(data); // Use Excel export function

              // handleExportCSV(data);
            }}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <SkeletonWrapper isLoading={history.isFetching}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SkeletonWrapper>
      <div className="flex justify-between items-center py-4">
        <Button
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default TransactionTable;


function RowActions({ transaction }: { transaction: TransactionHistoryRow }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <>
      {showEditDialog && (
        <EditTransactionDialog
          open={showEditDialog}
          setOpen={setShowEditDialog}
          transaction={{
            ...transaction,
            cost: transaction.cost && typeof transaction.cost === 'object' && 'toNumber' in transaction.cost
              ? transaction.cost.toNumber()
              : transaction.cost ?? 0,
            sellPrice: transaction.sellPrice && typeof transaction.sellPrice === 'object' && 'toNumber' in transaction.sellPrice
              ? transaction.sellPrice.toNumber()
              : transaction.sellPrice ?? 0,
          }}
          transactionId={transaction.id}
          trigger={undefined}
          successCallback={() => {
            console.log("Transaction edited successfully");
          }}
        />
      )}
      <DeleteTransactionDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        transactionId={transaction.id.toString()}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => setShowEditDialog(true)}
          >
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => setShowDeleteDialog(true)}
          >
            Delete
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
