import { ErrorBoundary } from "./ErrorBoundary";
import { withErrorBoundary } from "./hoc/withErrorBoundary";
import {
  PageErrorFallback,
  CardErrorFallback,
  InputErrorFallback,
  ButtonErrorFallback,
} from "./ErrorFallbacks";

export const errorBoundaries = {
  page: withErrorBoundary(ErrorBoundary, <PageErrorFallback />),
  card: withErrorBoundary(ErrorBoundary, <CardErrorFallback />),
  input: withErrorBoundary(ErrorBoundary, <InputErrorFallback />),
  button: withErrorBoundary(ErrorBoundary, <ButtonErrorFallback />),
};
