"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, ExternalLink, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { updateCMSPage } from "@/actions/admin/cms.actions";
import { format } from "date-fns";
import Link from "next/link";

interface CMSPage {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CMSPagesTableProps {
  pages: CMSPage[];
}

export function CMSPagesTable({ pages }: CMSPagesTableProps) {
  const router = useRouter();

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const result = await updateCMSPage(id, {
        isPublished: !currentStatus,
      });

      if (result.success) {
        toast.success(currentStatus ? "Page unpublished" : "Page published");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update page");
      }
    } catch (error) {
      toast.error("An error occurred while updating the page");
    }
  };

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-lg">
        <p className="text-muted-foreground">Initializing pages...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.title}</TableCell>
              <TableCell>
                <code className="text-sm">/{page.slug}</code>
              </TableCell>
              <TableCell>
                <Badge variant={page.isPublished ? "default" : "secondary"}>
                  {page.isPublished ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(page.updatedAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/pages/${page.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    {page.isPublished && (
                      <DropdownMenuItem asChild>
                        <Link href={`/${page.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Page
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleTogglePublish(page.id, page.isPublished)}
                    >
                      {page.isPublished ? "Unpublish" : "Publish"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
