export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export const toast = (options: ToastOptions): void => {
  // Lightweight adapter: the project already uses `react-hot-toast` elsewhere.
  // This keeps legacy imports working without imposing a new toast system.
  // eslint-disable-next-line no-console
  console.log('[toast]', options.variant ?? 'default', options.title ?? '', options.description ?? '');
};

