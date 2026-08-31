import { Divider } from "antd";
import Table from "antd/es/table";
import { columnsResource } from "../utils/common.util";

interface MaterialListTableProps {
  // Any plain object mapping material name -> amount (e.g. TableMaterialList).
  data: object;
  hideZero?: boolean;
  footer?: string;
  // When set, renders as the Table's own title bar instead of the default
  // "Material List" divider — for screens that group several of these
  // side-by-side under their own labels (e.g. Conversion's Enhancement/Evo
  // Legend/Enhancement Legend tables).
  title?: string;
}

// The repeated "Material List" divider + resource Table used by every
// equipment calculator.
const MaterialListTable: React.FC<MaterialListTableProps> = ({
  data,
  hideZero,
  footer,
  title,
}) => (
  <>
    {!title && <Divider orientation="left">Material List</Divider>}
    <Table
      size={"small"}
      title={title ? () => title : undefined}
      dataSource={(Object.entries(data) as [string, number][])
        .filter(([, value]) => !hideZero || value !== 0)
        .map(([key, value]) => ({
          mats: key,
          amount: value,
        }))}
      rowKey={"mats"}
      columns={columnsResource}
      pagination={false}
      bordered
      footer={footer ? () => footer : undefined}
    />
  </>
);

export default MaterialListTable;
