import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("pt-BR");
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

export function isMondayToWednesday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 3;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function secretariaLabel(s: string): string {
  const labels: Record<string, string> = {
    SEGEDAM: "SEGEDAM",
    SEGECEX: "SEGECEX",
    PRESIDENCIA: "Presidência",
    GABINETES: "Gabinetes",
    ESTAGIDATA: "ESTAGIDATA",
    PCD: "PCD",
  };
  return labels[s] ?? s;
}
