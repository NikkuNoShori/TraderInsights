import { toast as hotToast } from "react-hot-toast";

export const toast = {
  success: (message: string) => hotToast.success(message),
  error: (message: string) => hotToast.error(message),
  info: (message: string) => hotToast(message),
  loading: (message: string) => hotToast.loading(message),
  custom: hotToast,
  dismiss: hotToast.dismiss,
};
