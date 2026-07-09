"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/src/domain/product";

export function ProductInfoTabs({ product }: { product: Product }) {
  const tabs = [
    { id: "efficacy", label: "功效說明", content: product.description },
    {
      id: "content",
      label: "商品內容",
      content: `${product.minerals.join("、")}。商品會因手圍不同而有些微變化。`
    },
    { id: "warranty", label: "保固與維修", content: "三個月內免費保固一次，包含換線、五金汰換與損壞維修。" },
    { id: "sizing", label: "手圍測量", content: "請用皮尺平貼在想戴手鍊的位置，繞一圈即為淨手圍。" }
  ];

  return (
    <Tabs defaultValue={tabs[0].id}>
      <TabsList className="h-auto! w-full flex-wrap justify-start gap-x-8 gap-y-3 rounded-none border-y border-crystal-line bg-transparent p-0 py-4">
        {tabs.map((tab) => (
          <TabsTrigger
            className="h-auto rounded-none border-t-0 border-x-0 border-b border-transparent bg-transparent px-1 pb-2 text-sm text-crystal-muted shadow-none! transition hover:border-crystal-gold hover:text-crystal-ink data-[state=active]:border-crystal-gold data-[state=active]:bg-transparent data-[state=active]:text-crystal-ink data-[state=active]:shadow-none!"
            key={tab.id}
            value={tab.id}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent className="tab-panel-reveal py-7 text-sm leading-8 whitespace-pre-line text-crystal-muted" key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
