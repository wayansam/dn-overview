import { Tag, Typography } from "antd";
import ClassIconImg from "./ClassIconImg";
const { Text } = Typography;

interface CharacterNameLabelProps {
  name: string;
  classId?: string;
  isMain?: boolean;
}

// Icon + name never wrap (narrow table cells would otherwise break the name
// letter by letter); the Main tag drops to the next line instead.
const CharacterNameLabel = ({
  name,
  classId,
  isMain,
}: CharacterNameLabelProps) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 4,
    }}
  >
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
      }}
    >
      <ClassIconImg classId={classId} />
      <Text>{name}</Text>
    </span>
    {isMain && (
      <Tag color="gold" style={{ marginInlineEnd: 0 }}>
        Main
      </Tag>
    )}
  </div>
);

export default CharacterNameLabel;
