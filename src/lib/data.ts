import { BankAccount, Recipient } from "./types";

export const bankAccounts: BankAccount[] = [
  {
    id: "moniepoint",
    name: "Moniepoint",
    shortName: "MNP",
    balance: 3000,
    accountNumber: "****4821",
    color: "#0055FF",
    icon: "Wallet",
    logoUrl: "https://ykgqfhxtwbbpjpcbayeg.supabase.co/storage/v1/object/public/Bnk%20Images/moniepoint-logo.png",
  },
  {
    id: "opay",
    name: "OPay",
    shortName: "OPY",
    balance: 4500,
    accountNumber: "****7392",
    color: "#1DC26F",
    icon: "Smartphone",
    logoUrl: "https://ykgqfhxtwbbpjpcbayeg.supabase.co/storage/v1/object/public/Bnk%20Images/opay-logo.png",
  },
  {
    id: "kuda",
    name: "Kuda",
    shortName: "KDA",
    balance: 2000,
    accountNumber: "****1156",
    color: "#7B2AE0",
    icon: "CreditCard",
    logoUrl: "https://ykgqfhxtwbbpjpcbayeg.supabase.co/storage/v1/object/public/Bnk%20Images/kuda.png",
  },
  {
    id: "access",
    name: "Access Bank",
    shortName: "ACC",
    balance: 8200,
    accountNumber: "****6038",
    color: "#F47920",
    icon: "Building2",
    logoUrl: "https://ykgqfhxtwbbpjpcbayeg.supabase.co/storage/v1/object/public/Bnk%20Images/access.png",
  },
  {
    id: "gtbank",
    name: "GTBank",
    shortName: "GTB",
    balance: 1800,
    accountNumber: "****9514",
    color: "#E44311",
    icon: "Landmark",
    logoUrl: "https://ykgqfhxtwbbpjpcbayeg.supabase.co/storage/v1/object/public/Bnk%20Images/gtb-logo.png",
  },
];

export const sampleRecipients: Recipient[] = [
  {
    id: "shoprite",
    name: "Shoprite Supermarket",
    bank: "First Bank",
    accountNumber: "****3290",
  },
  {
    id: "jumia",
    name: "Jumia Nigeria",
    bank: "Zenith Bank",
    accountNumber: "****7711",
  },
];

export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString("en-NG")}`;
};
