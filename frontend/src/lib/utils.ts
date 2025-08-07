import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utilidades para Ethereum
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return 'N/A';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance: string | number): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '0.0000';
  return num.toFixed(4);
}

import { ethers } from "ethers";

export function weiToEth(wei: ethers.BigNumberish): number {
  return parseFloat(ethers.formatEther(wei));
}

export function formatPrice(priceWei: ethers.BigNumberish): string {
  return `$${weiToEth(priceWei).toFixed(2)}`;
}

export function getPriceRanges(priceRanges: number[]): string[] {
  let ranges = [];
  for (let i = 0; i < priceRanges.length - 1; i++) {
    ranges.push(`$${priceRanges[i]} - $${priceRanges[i + 1]}`);
  }
  return ranges;
}

export function ethToWei(eth: string | number): bigint {
  const ethStr = eth.toString();
  return BigInt(Math.floor(parseFloat(ethStr) * Math.pow(10, 18)));
}

// Utilidades para validación
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0;
}

// Utilidades para manejo de errores
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.reason) return error.reason;
  return 'Error desconocido';
}

// Utilidades para tiempo
export function formatTimeRemaining(targetTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = targetTime - now;
  
  if (diff <= 0) {
    const timePassed = Math.abs(diff);
    if (timePassed < 300) {
      return `Período de gracia: ${Math.floor(timePassed / 60)}:${(timePassed % 60).toString().padStart(2, '0')}`;
    }
    return "Ronda terminada";
  }
  
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Utilidades para API
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
