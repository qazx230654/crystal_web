"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { contactLinks } from "@/config/contact";
import type { Product } from "@/src/domain/product";
import {
  customStringOptions,
  fitOptions,
  metalToneOptions,
  pendantOptions,
  tarotTopicOptions,
  yesNoOptions
} from "@/src/domain/product";

const braceletImages = [
  "https://goodaytarot.com/images/d-design/d005.jpg",
  "https://goodaytarot.com/images/d-design/d001.jpg"
];

const chainImages = [
  "https://goodaytarot.com/images/d-design/d004.jpg",
  "https://goodaytarot.com/images/d-design/d005.jpg"
];

const pendantImage = "https://goodaytarot.com/images/workshop-products.jpg";

function FormSection({
  title,
  body,
  optional,
  children
}: {
  title: string;
  body?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="border border-crystal-line bg-white/82 p-5 md:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {body ? <p className="mt-2 text-sm leading-7 text-crystal-muted">{body}</p> : null}
        </div>
        {optional ? <span className="text-xs text-crystal-muted">選填</span> : null}
      </div>
      {children}
    </section>
  );
}

function ChoiceButton({
  active,
  label,
  note,
  onClick
}: {
  active: boolean;
  label: string;
  note?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`border p-4 text-left transition ${active ? "border-crystal-ink bg-crystal-pearl" : "border-crystal-line bg-white hover:border-crystal-rose"}`}
      onClick={onClick}
      type="button"
    >
      <span className="block font-semibold">{label}</span>
      {note ? <span className="mt-2 block text-sm leading-6 text-crystal-muted">{note}</span> : null}
    </button>
  );
}

export function CustomForm({ planCode, product }: { planCode: string; product: Product }) {
  const [wish, setWish] = useState("");
  const [wristSize, setWristSize] = useState("");
  const [tightness, setTightness] = useState(fitOptions[0].value);
  const [metal, setMetal] = useState(metalToneOptions[2].value);
  const [chain, setChain] = useState(yesNoOptions[1].value);
  const [beadFrame, setBeadFrame] = useState(yesNoOptions[1].value);
  const [stringType, setStringType] = useState(customStringOptions[2].label);
  const [pendant, setPendant] = useState(pendantOptions[1].value);
  const [colorPreference, setColorPreference] = useState("");
  const [notes, setNotes] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { addItem } = useCart();

  return (
    <form
      className="mt-8 grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        addItem(product, undefined, {
          plan: planCode,
          wish,
          wristSize: `${wristSize} cm`,
          tightness,
          metal,
          chain,
          beadFrame,
          stringType,
          pendant,
          ...(colorPreference ? { colorPreference } : {}),
          ...(notes ? { notes } : {}),
          ...(contact ? { contact } : {})
        });
      }}
    >
      {planCode === "B" ? (
        <FormSection body="選擇想占卜的主題後，店家會依照解析結果規劃水晶配置。" title="1. 想占卜哪個主題？">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tarotTopicOptions.map((topic) => (
              <button className="border border-crystal-line bg-white p-4 text-left transition hover:border-crystal-rose" key={topic} type="button">
                <span className="block font-semibold">{topic}</span>
                <span className="mt-1 block text-sm text-crystal-muted">點選查看內容</span>
              </button>
            ))}
          </div>
        </FormSection>
      ) : (
        <FormSection body="例如：提升自信、招財、愛情、療癒、保護氣場，也可以自由描述目前狀態。" title="1. 您想要什麼功效？">
          <textarea
            className="min-h-36 w-full border border-crystal-line bg-white p-4 outline-crystal-rose"
            onChange={(event) => setWish(event.target.value)}
            placeholder="寫下您想要的功效或願望，也可以描述目前的困境或期待的改變"
            required
            value={wish}
          />
        </FormSection>
      )}

      <FormSection body="請用皮尺量淨手圍（cm），可選 13-19 cm，不需要自行加減。" title="2. 手圍尺寸是多少？">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="w-40 border border-crystal-line bg-white p-4 outline-crystal-rose"
            max={19}
            min={13}
            onChange={(event) => setWristSize(event.target.value)}
            placeholder="例如：15.5"
            required
            step="0.1"
            type="number"
            value={wristSize}
          />
          <span className="text-sm text-crystal-muted">cm</span>
        </div>
        <p className="mt-3 text-xs leading-6 text-crystal-muted">不知道怎麼量？拿皮尺平貼在手腕最細的位置，繞一圈的長度就是淨手圍。</p>
      </FormSection>

      <FormSection body="這會影響手鍊的實際製作尺寸。" title="3. 手圍的鬆緊偏好？">
        <div className="grid gap-3 sm:grid-cols-2">
          {fitOptions.map((option) => (
            <ChoiceButton active={tightness === option.value} key={option.value} label={option.label} note={option.value === "剛好" ? "會有水晶壓痕但不掐肉，手鍊緊貼手腕。" : "可輕微滑動，戴起來較為舒適寬鬆。"} onClick={() => setTightness(option.value)} />
          ))}
        </div>
      </FormSection>

      <FormSection body="這會影響配件（銀管、珠框等）的材質選擇。" title="4. 喜歡金飾還是銀飾？">
        <div className="grid gap-3 sm:grid-cols-3">
          {metalToneOptions.slice(0, 2).map((option, index) => (
            <button
              className={`overflow-hidden border transition ${metal === option.value ? "border-crystal-ink bg-crystal-pearl" : "border-crystal-line bg-white hover:border-crystal-rose"}`}
              key={option.value}
              onClick={() => setMetal(option.value)}
              type="button"
            >
              <Image alt={option.label} className="h-32 w-full object-cover" height={240} src={braceletImages[index]} width={360} />
              <span className="block p-3 text-sm">{option.label}</span>
            </button>
          ))}
          <ChoiceButton active={metal === metalToneOptions[2].value} label={metalToneOptions[2].label} onClick={() => setMetal(metalToneOptions[2].value)} />
        </div>
      </FormSection>

      <FormSection body="可分開選擇，以下附上參考圖片。" title="5. 要加銀管或珠框嗎？">
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {chainImages.map((image, index) => (
            <Image alt={`銀管珠框示意 ${index + 1}`} className="h-44 w-full border border-crystal-line object-cover" height={280} key={image} src={image} width={420} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-3 font-semibold">銀管</p>
            <div className="grid grid-cols-2 gap-3">
              {yesNoOptions.map((option) => (
                <ChoiceButton active={chain === option.value} key={option.value} label={option.label} onClick={() => setChain(option.value)} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 font-semibold">珠框</p>
            <div className="grid grid-cols-2 gap-3">
              {yesNoOptions.map((option) => (
                <ChoiceButton active={beadFrame === option.value} key={option.value} label={option.label} onClick={() => setBeadFrame(option.value)} />
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection body="預設為彈力繩；若更換扣具需額外加收 200 元。" title="6. 要換龍蝦扣或磁扣嗎？">
        <div className="grid gap-3 sm:grid-cols-3">
          {customStringOptions.map((item) => (
            <button
              className={`border bg-white transition ${stringType === item.label ? "border-crystal-ink" : "border-crystal-line hover:border-crystal-rose"}`}
              key={item.label}
              onClick={() => setStringType(item.label)}
              type="button"
            >
              <Image alt={item.label} className="h-32 w-full object-cover" height={220} src={item.image} width={320} />
              <span className="block p-3 text-sm font-semibold">{item.label}</span>
              <span className="block px-3 pb-3 text-xs text-crystal-muted">{item.note}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 border border-crystal-gold/50 bg-crystal-gold/10 p-4 text-sm leading-7 text-crystal-muted">
          提醒：龍蝦扣及磁扣會使用沒有彈性的魚線製作，較容易因拉扯或勾到而損壞；若想要最方便日常使用，建議選擇彈力繩。
        </p>
      </FormSection>

      <FormSection body="可加掛於手鍊上，請選擇是否需要，細節可下單後與店家討論。" title="7. 要加吊飾嗎？">
        <Image alt="吊飾示意" className="mb-4 h-56 w-full border border-crystal-line object-cover" height={360} src={pendantImage} width={720} />
        <div className="grid gap-3 sm:grid-cols-2">
          {pendantOptions.map((option) => (
            <ChoiceButton active={pendant === option.value} key={option.value} label={option.label} onClick={() => setPendant(option.value)} />
          ))}
        </div>
      </FormSection>

      <FormSection body="例如：偏粉色系、紫色、透明；沒有特別指定也沒關係，留空即可。" optional title="8. 有想要的水晶顏色嗎？">
        <textarea
          className="min-h-32 w-full border border-crystal-line bg-white p-4 outline-crystal-rose"
          onChange={(event) => setColorPreference(event.target.value)}
          placeholder="寫下喜歡的顏色或色系，沒有指定可以留空"
          value={colorPreference}
        />
      </FormSection>

      <FormSection body="任何其他特殊需求都可以寫在這裡，例如避開材質、特別風格、紀念意義等。" optional title="9. 還有其他特殊需求嗎？">
        <textarea
          className="min-h-32 w-full border border-crystal-line bg-white p-4 outline-crystal-rose"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="有任何其他想說的都可以寫在這裡"
          value={notes}
        />
      </FormSection>

      <FormSection title="10. 完成！付完訂金後記得加入 LINE">
        <div className="border border-emerald-300 bg-emerald-50 p-5 text-sm leading-7 text-crystal-ink">
          <p>付款訂金後，請加入官方 LINE 並傳送「訂單編號 + 姓名」，設計師才能將客製化水晶初稿及成品圖傳送給你。</p>
          <a className="mt-4 inline-flex items-center gap-2 bg-emerald-500 px-5 py-3 font-semibold text-white" href={contactLinks.line.href} rel="noreferrer" target="_blank">
            <MessageCircle size={16} /> 加入官方 LINE
          </a>
        </div>
        <label className="mt-5 grid gap-2">
          <span className="text-sm text-crystal-muted">Instagram 帳號 / LINE ID</span>
          <input
            className="border border-crystal-line bg-white p-4 outline-crystal-rose"
            onChange={(event) => setContact(event.target.value)}
            placeholder="例如：@your_ig_handle 或 LINE ID"
            value={contact}
          />
        </label>
      </FormSection>

      {submitted ? <p className="border border-crystal-line bg-crystal-pearl p-4 text-sm text-crystal-muted">已加入購物袋，請前往購物袋確認內容並結帳。</p> : null}
      <div className="flex flex-wrap justify-between gap-3">
        <Link className="border border-crystal-line bg-white px-5 py-3 text-sm text-crystal-muted" href="/custom">
          返回方案頁
        </Link>
        <button className="inline-flex items-center gap-2 bg-crystal-ink px-6 py-3 font-semibold text-white" type="submit">
          <Check size={16} /> 確認，加入購物車
        </button>
      </div>
    </form>
  );
}
