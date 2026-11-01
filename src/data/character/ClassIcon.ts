import {
  CHARACTER_2NDJOB,
  CHARACTER_CLASS,
} from "../../constants/InGame.constants";

// Every png in assets/class is picked up automatically, keyed by file name
// (e.g. "gladiator.png" -> "gladiator"). Name new icons after the ClassData
// id, or the kebab-cased base class / 2nd job name.
const iconModules = import.meta.glob<string>("../../assets/class/*.png", {
  eager: true,
  import: "default",
});

export const ClassIcon: Record<string, string> = Object.fromEntries(
  Object.entries(iconModules).map(([path, url]) => [
    path.slice(path.lastIndexOf("/") + 1, -".png".length),
    url,
  ]),
);

const toIconKey = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export const getClassIcon = (classId?: string): string | undefined =>
  classId ? ClassIcon[classId] : undefined;

export const getBaseClassIcon = (
  baseClass?: CHARACTER_CLASS,
): string | undefined => (baseClass ? ClassIcon[toIconKey(baseClass)] : undefined);

export const getSecondJobIcon = (
  secondJob?: CHARACTER_2NDJOB,
): string | undefined => (secondJob ? ClassIcon[toIconKey(secondJob)] : undefined);
