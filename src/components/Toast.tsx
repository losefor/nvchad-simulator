import type { Toast as ToastType } from "../types";

interface Props {
  toast: ToastType | null;
}

export default function Toast({ toast }: Props) {
  if (!toast) return null;
  return <div className={"toast " + (toast.kind || "")}>{toast.text}</div>;
}
