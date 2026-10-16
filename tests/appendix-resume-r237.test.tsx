// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۳۷ — کنترلِ کاملِ کاربر رویِ رکوردِ «ادامهٔ مطالعه»
// (بندِ ① پیشنهادِ ۲۳۶). قراردادهایی که قفل می‌شوند:
//   A. clearAppendixResume (کتابخانه):
//     ① رکورد → پاک‌کردن → هر دو کلید (نو + legacyِ ۲۳۳) غیب + خواندن null
//     ② مشترکینِ storeِ خارجی خبر می‌شوند (ایدئومِ r231)
//     ③ رکوردِ فقط-legacy (مهاجرتِ روی-خواندن) هم واقعاً می‌میرد —
//       اگر کلیدِ قدیمی بماند، «پاک‌کردن» دروغ بود
//   B. هدرِ سراسری:
//     ④ کلیکِ راست (contextmenu) = پاک‌کردن + توست + دکمه بی‌درنگ غیب
//     ⑤ پاک‌کردنِ هدر صفرِ نوشتن در استورِ یادگیری دارد
//   C. پروفایل (بخشِ تازه):
//     ⑥ بی‌رکورد = هیچ بخشی (صداقت — هیچ کنترلِ ساختگی)
//     ⑦ با رکورد = بخش با عنوان + لایه + «پاک‌کردن» → رکورد غیب، بخش واکنشی غیب
//     ⑧ «ادامه» = پنجمین در: پاپ‌اُور بسته + viewِ همان لایه + رکورد دست‌نخورده
//   D. نشانگرِ سرِ ضمیمه:
//     ⑨ کلیکِ راست همان‌جا هم پاک می‌کند؛ onGo هرگز صدا نمی‌شود
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import HeaderResumeButton from "@/components/study/shell/header-resume-button";
import AppendixResumePill from "@/components/study/lesson/appendix-resume-pill";
import ProfilePopover from "@/components/study/profile/profile-popover";
import {
  writeAppendixResume,
  writeBgLastTopic,
  readAppendixResume,
  clearAppendixResume,
  subscribeAppendixResume,
  APPENDIX_SCOPES,
} from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import type { AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const rec: AppendixResumeItem = {
  scope: "verbs",
  id: "eat",
  title: "eat — ate — eaten",
  hint: "خوردن",
};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  // jsdom matchMedia ندارد — SettingsPopover وضعیتِ نصبِ PWA را می‌پرسد
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

beforeEach(() => {
  localStorage.clear();
  toastSpy.mockClear();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    results: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

const KEY_NEW = "vision2-bg-last-item";
const KEY_LEGACY = "vision2-bg-last-topic";

describe("A — clearAppendixResume (کتابخانه)", () => {
  it("① رکورد → پاک‌کردن → هر دو کلید غیب + خواندن null", () => {
    act(() => {
      writeAppendixResume(rec);
    });
    expect(readAppendixResume()).not.toBeNull();
    expect(localStorage.getItem(KEY_NEW)).not.toBeNull();
    act(() => {
      clearAppendixResume();
    });
    expect(readAppendixResume()).toBeNull();
    expect(localStorage.getItem(KEY_NEW)).toBeNull();
    expect(localStorage.getItem(KEY_LEGACY)).toBeNull();
  });

  it("② مشترکینِ storeِ خارجی خبر می‌شوند", () => {
    const spy = vi.fn();
    const un = subscribeAppendixResume(spy);
    act(() => {
      clearAppendixResume();
    });
    expect(spy).toHaveBeenCalled();
    un();
  });

  it("③ رکوردِ فقط-legacy هم واقعاً می‌میرد (مهاجرتِ روی-خواندن نمی‌تواند زنده‌اش کند)", () => {
    localStorage.setItem(
      KEY_LEGACY,
      JSON.stringify({ id: "t-present-simple", title: "حال ساده", page: "ص ۲۳" }),
    );
    // مهاجرتِ روی-خواندنِ r233: خواننده، legacy را grammar می‌بیند
    const migrated = readAppendixResume();
    expect(migrated?.scope).toBe("grammar");
    act(() => {
      clearAppendixResume();
    });
    expect(localStorage.getItem(KEY_LEGACY)).toBeNull();
    expect(readAppendixResume()).toBeNull();
  });
});

describe("B — هدرِ سراسری: کلیکِ راست = پاک‌کردن", () => {
  it("④ contextmenu → پاک‌شدنِ رکورد + توست + دکمهٔ واکنشی غیب", () => {
    act(() => {
      writeAppendixResume(rec);
    });
    const { unmount } = render(<HeaderResumeButton />);
    const btn = screen.getByTestId("header-resume-button");
    expect(btn).toBeInTheDocument();
    act(() => {
      fireEvent.contextMenu(btn);
    });
    expect(readAppendixResume()).toBeNull();
    expect(screen.queryByTestId("header-resume-button")).toBeNull();
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "ادامهٔ مطالعه پاک شد" }),
    );
    unmount();
  });

  it("⑤ پاک‌کردن از هدر صفرِ نوشتن در استورِ یادگیری دارد", () => {
    useStudy.setState({ known: { apple: true, book: true } } as Partial<ReturnType<typeof useStudy.getState>>);
    act(() => {
      writeAppendixResume(rec);
    });
    const { unmount } = render(<HeaderResumeButton />);
    act(() => {
      fireEvent.contextMenu(screen.getByTestId("header-resume-button"));
    });
    expect(useStudy.getState().known).toEqual({ apple: true, book: true });
    expect(useStudy.getState().view).toEqual({ type: "home" });
    unmount();
  });
});

describe("C — پروفایل: بخشِ «ادامهٔ مطالعه»", () => {
  const openProfile = () => {
    const trigger = screen.getByRole("button", { name: "پروفایل من" });
    act(() => {
      fireEvent.pointerDown(trigger);
      fireEvent.click(trigger);
    });
  };

  it("⑥ بی‌رکورد = هیچ بخشی رندر نمی‌شود (صداقت)", () => {
    render(<ProfilePopover />);
    openProfile();
    expect(screen.getByText("پروفایل یادگیرنده")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-resume-section")).toBeNull();
    expect(screen.queryByTestId("profile-resume-clear")).toBeNull();
  });

  it("⑦ با رکورد = بخش با عنوان/لایه/دکمه → «پاک‌کردن» رکورد را برمی‌دارد و بخش واکنشی غیب می‌شود", () => {
    act(() => {
      writeAppendixResume(rec);
    });
    render(<ProfilePopover />);
    openProfile();
    const section = screen.getByTestId("profile-resume-section");
    expect(section).toHaveTextContent("eat — ate — eaten");
    expect(section).toHaveTextContent("افعال بی‌قاعده");
    expect(section).toHaveTextContent("خوردن");
    act(() => {
      fireEvent.click(screen.getByTestId("profile-resume-clear"));
    });
    expect(readAppendixResume()).toBeNull();
    expect(screen.queryByTestId("profile-resume-section")).toBeNull();
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "ادامهٔ مطالعه پاک شد" }),
    );
  });

  it("⑧ «ادامه» = پنجمین در: پاپ‌اُور بسته + viewِ همان لایه + رکورد دست‌نخورده", () => {
    act(() => {
      writeAppendixResume(rec);
    });
    render(<ProfilePopover />);
    openProfile();
    expect(screen.getByTestId("profile-resume-section")).toBeInTheDocument();
    const goBtn = screen.getByRole("button", { name: /ادامه/ });
    act(() => {
      fireEvent.click(goBtn);
    });
    expect(useStudy.getState().view).toEqual({ type: "appendix", verbBase: "eat" });
    // پرش، پاک‌کردن نیست — رکورد باید زنده بماند
    expect(readAppendixResume()).not.toBeNull();
    expect(screen.queryByTestId("profile-resume-section")).toBeNull();
  });

  it("⑧-ب — رکوردِ scopeِ ناشناخته در بخشِ پروفایل رندر نمی‌شود (پالایشِ snapshot)", () => {
    expect(APPENDIX_SCOPES).not.toContain("bogus");
    localStorage.setItem(
      KEY_NEW,
      JSON.stringify({ scope: "bogus", id: "x", title: "جعلی" }),
    );
    render(<ProfilePopover />);
    openProfile();
    expect(screen.queryByTestId("profile-resume-section")).toBeNull();
  });
});

describe("D — نشانگرِ سرِ ضمیمه: کلیکِ راست همان‌جا هم پاک می‌کند", () => {
  it("⑨ contextmenu → رکورد غیب + دکمه غیب + onGo هرگز صدا نشد", () => {
    const onGo = vi.fn();
    act(() => {
      writeAppendixResume(rec);
    });
    render(<AppendixResumePill onGo={onGo} />);
    const pill = screen.getByTestId("appendix-resume-pill");
    act(() => {
      fireEvent.contextMenu(pill);
    });
    expect(readAppendixResume()).toBeNull();
    expect(screen.queryByTestId("appendix-resume-pill")).toBeNull();
    expect(onGo).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "ادامهٔ مطالعه پاک شد" }),
    );
  });

  it("⑨-ب — بی‌رکورد نشانگر اصلاً رندر نمی‌شود", () => {
    render(<AppendixResumePill onGo={vi.fn()} />);
    expect(screen.queryByTestId("appendix-resume-pill")).toBeNull();
  });

  it("⑩ writeBgLastTopic (مسیرِ قدیمیِ درسنامه) هم پاک‌شدنی است", () => {
    act(() => {
      writeBgLastTopic({ id: "t-future", title: "آینده", page: "ص ۴۰" });
    });
    expect(readAppendixResume()?.scope).toBe("grammar");
    act(() => {
      clearAppendixResume();
    });
    expect(readAppendixResume()).toBeNull();
    expect(localStorage.getItem(KEY_NEW)).toBeNull();
    expect(localStorage.getItem(KEY_LEGACY)).toBeNull();
  });
});
