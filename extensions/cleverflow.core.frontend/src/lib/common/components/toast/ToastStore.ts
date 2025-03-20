import { writable } from 'svelte/store';

class Toast {
    id?: number;
    message?: string;
    type?: ToastType;
    constructor(id: number, message: string, type: ToastType) {
        this.id = id;
        this.message = message;
        this.type = type;
    }
}

export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

export const toasts = writable<Toast[]>([]);

export function addToast(message: string, type = ToastType.SUCCESS, duration = 3000) {
    const id = Date.now();
    toasts.update(t => [...t, new Toast(id, message, type)]);
    setTimeout(() => removeToast(id), duration);
}

export function removeToast(id: number) {
    toasts.update(t => t.filter((toast: Toast) => toast.id !== id));
}
