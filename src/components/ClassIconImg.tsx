import { getClassById } from "../data/character/ClassData";
import { getClassIcon } from "../data/character/ClassIcon";

interface ClassIconImgProps {
  classId?: string;
  size?: number;
}

// Renders nothing for classes that have no icon yet.
const ClassIconImg = ({ classId, size = 20 }: ClassIconImgProps) => {
  const src = getClassIcon(classId);
  if (!src) return null;
  const className = getClassById(classId)?.name ?? classId;
  return (
    <img
      src={src}
      alt={className}
      title={className}
      width={size}
      height={size}
      style={{ display: "block" }}
    />
  );
};

export default ClassIconImg;
