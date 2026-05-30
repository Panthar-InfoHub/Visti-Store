"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { ProductSection } from "@/lib/zod-schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SectionEditorProps {
  sections: ProductSection[];
  onChange: (sections: ProductSection[]) => void;
}

interface SortableSectionProps {
  section: ProductSection;
  index: number;
  onEdit: (index: number, section: ProductSection) => void;
  onRemove: (index: number) => void;
}

function SortableSection({ section, index, onEdit, onRemove }: SortableSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `section-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSectionTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Text Block";
      case "bullets":
        return "Bullet List";
      case "specs":
        return "Specifications";
      default:
        return type;
    }
  };

  const handleTitleChange = (newTitle: string) => {
    onEdit(index, { ...section, title: newTitle });
  };

  const handleContentChange = (newContent: any) => {
    if (section.type === "text") {
      onEdit(index, { ...section, content: newContent });
    } else if (section.type === "bullets") {
      onEdit(index, { ...section, items: newContent });
    } else if (section.type === "specs") {
      onEdit(index, { ...section, items: newContent });
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
                type="button"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>
              <CardTitle className="text-base">
                {getSectionTypeLabel(section.type)} - {section.title || "Untitled"}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {!isCollapsed && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={section.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter section title"
              />
            </div>

            {section.type === "text" && (
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={section.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Enter content"
                  rows={5}
                />
              </div>
            )}

            {section.type === "bullets" && (
              <div className="space-y-2">
                <Label>Bullet Points</Label>
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[itemIndex] = e.target.value;
                        handleContentChange(newItems);
                      }}
                      placeholder={`Point ${itemIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newItems = section.items.filter((_, i) => i !== itemIndex);
                        handleContentChange(newItems);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleContentChange([...section.items, ""])}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Point
                </Button>
              </div>
            )}

            {section.type === "specs" && (
              <div className="space-y-2">
                <Label>Specifications</Label>
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-2">
                    <Input
                      value={item.key}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[itemIndex] = { ...item, key: e.target.value };
                        handleContentChange(newItems);
                      }}
                      placeholder="Key"
                      className="flex-1"
                    />
                    <Input
                      value={item.value}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[itemIndex] = { ...item, value: e.target.value };
                        handleContentChange(newItems);
                      }}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newItems = section.items.filter((_, i) => i !== itemIndex);
                        handleContentChange(newItems);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleContentChange([...section.items, { key: "", value: "" }])}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Specification
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export function SectionEditor({ sections, onChange }: SectionEditorProps) {
  const [newSectionType, setNewSectionType] = useState<"text" | "bullets" | "specs">("text");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split("-")[1]);
      const newIndex = parseInt(over.id.toString().split("-")[1]);
      onChange(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const addSection = () => {
    let newSection: ProductSection;

    switch (newSectionType) {
      case "text":
        newSection = { type: "text", title: "", content: "" };
        break;
      case "bullets":
        newSection = { type: "bullets", title: "", items: [""] };
        break;
      case "specs":
        newSection = { type: "specs", title: "", items: [{ key: "", value: "" }] };
        break;
    }

    onChange([...sections, newSection]);
  };

  const editSection = (index: number, updatedSection: ProductSection) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    onChange(newSections);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sections.map((_, i) => `section-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section, index) => (
            <SortableSection
              key={`section-${index}`}
              section={section}
              index={index}
              onEdit={editSection}
              onRemove={removeSection}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Select value={newSectionType} onValueChange={(value: any) => setNewSectionType(value)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Block</SelectItem>
                <SelectItem value="bullets">Bullet List</SelectItem>
                <SelectItem value="specs">Specifications</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" onClick={addSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
