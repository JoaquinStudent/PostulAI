import { get, set, del } from "idb-keyval";

const CONTEXT_KEY = "user-context";
const VAULT_KEY = "api-key-vault";

export async function saveContext(raw: string): Promise<void> {
  await set(CONTEXT_KEY, raw);
}

export async function loadContext(): Promise<string | null> {
  const val = await get<string>(CONTEXT_KEY);
  return val ?? null;
}

export async function deleteContext(): Promise<void> {
  await del(CONTEXT_KEY);
}

export async function saveVaultBlob(blob: ArrayBuffer): Promise<void> {
  await set(VAULT_KEY, blob);
}

export async function loadVaultBlob(): Promise<ArrayBuffer | null> {
  const val = await get<ArrayBuffer>(VAULT_KEY);
  return val ?? null;
}

export async function deleteVaultBlob(): Promise<void> {
  await del(VAULT_KEY);
}

export async function clearAll(): Promise<void> {
  await del(CONTEXT_KEY);
  await del(VAULT_KEY);
}
