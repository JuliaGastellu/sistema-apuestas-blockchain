import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    switch (variant) {
      case "destructive":
        sonnerToast.error(title, { description });
        break;
      case "success":
        sonnerToast.success(title, { description });
        break;
      default:
        sonnerToast.info(title, { description });
        break;
    }
  };

  return { toast };
}
