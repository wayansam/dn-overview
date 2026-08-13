export interface PatchNoteEntry {
  href: string;
  label: string;
}

interface PatchNoteLinkProps extends PatchNoteEntry {
  heading?: string;
}

export const PatchNoteLink: React.FC<PatchNoteLinkProps> = ({
  href,
  label,
  heading = "Patch Note related",
}) => (
  <p>
    {heading}{" "}
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  </p>
);

interface PatchNoteSectionProps {
  entries: PatchNoteEntry[];
  heading?: string;
}

export const PatchNoteSection: React.FC<PatchNoteSectionProps> = ({
  entries,
  heading = "Patch Note related :",
}) => (
  <>
    <p>{heading}</p>
    {entries.map((entry) => (
      <p key={entry.href}>
        <a href={entry.href} target="_blank" rel="noopener noreferrer">
          {entry.label}
        </a>
      </p>
    ))}
  </>
);
