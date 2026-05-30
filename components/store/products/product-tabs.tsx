"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Section {
  type: "bullets" | "specs" | "text";
  title: string;
  items?: string[] | { key: string; value: string }[];
  content?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ProductTabsProps {
  description: string | null;
  sections: Section[];
  faqs: FAQ[];
}

export function ProductTabs({ description, sections, faqs }: ProductTabsProps) {
  return (
    <div className="mt-8 border-t pt-8">
      <Tabs defaultValue="description" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="inline-flex h-auto p-1.5 bg-gray-100 rounded-full border border-gray-200">
            <TabsTrigger
              value="description"
              className="rounded-full px-6 py-2 text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
            >
              Description
            </TabsTrigger>
            {sections.length > 0 && (
              <TabsTrigger
                value="specifications"
                className="rounded-full px-6 py-2 text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
              >
                Specifications
              </TabsTrigger>
            )}
            {faqs.length > 0 && (
              <TabsTrigger
                value="faq"
                className="rounded-full px-6 py-2 text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
              >
                FAQ
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="max-w-6xl mx-auto">
          <TabsContent value="description" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <div className="prose prose-gray max-w-none">
              {description ? (
                <p className="text-gray-600 leading-relaxed text-base">{description}</p>
              ) : (
                <p className="text-gray-500 text-center italic">No description available</p>
              )}
            </div>
          </TabsContent>

          {sections.length > 0 && (
            <TabsContent value="specifications" className="mt-0 space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              {sections.map((section, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>

                  {section.type === "bullets" && Array.isArray(section.items) && (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                      {(section.items as string[]).map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-gray-600 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-2 shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.type === "specs" && Array.isArray(section.items) && (
                    <div className="border rounded-lg overflow-hidden bg-gray-50/50">
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-gray-200">
                          {(section.items as { key: string; value: string }[]).map((item, i) => (
                            <tr key={i} className="group hover:bg-white transition-colors">
                              <td className="px-6 py-3 text-sm font-medium text-gray-900 w-1/4 bg-gray-50/50">
                                {item.key}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-600">{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.type === "text" && section.content && (
                    <div className="text-gray-600 leading-relaxed text-base">{section.content}</div>
                  )}
                </div>
              ))}
            </TabsContent>
          )}

          {faqs.length > 0 && (
            <TabsContent
              value="faq"
              className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 w-full max-w-4xl mx-auto"
            >
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
