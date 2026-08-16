import { Divider } from "antd";
import Table from "antd/es/table";
import { columnsResource } from "../utils/common.util";

interface MaterialListTableProps {
  // Any plain object mapping material name -> amount (e.g. TableMaterialList).
  data: object;
  hideZero?: boolean;
  footer?: string;
}

// The repeated "Material List" divider + resource Table used by every
// equipment calculator.
const MaterialListTable: React.FC<MaterialListTableProps> = ({
  data,
  hideZero,
  footer,
}) => (
  <>
    <Divider orientation="left">Material List</Divider>
    <Table
      size={"small"}
      dataSource={(Object.entries(data) as [string, number][])
        .filter(([, value]) => !hideZero || value !== 0)
        .map(([key, value]) => ({
          mats: key,
          amount: value,
        }))}
      columns={columnsResource}
      pagination={false}
      bordered
      footer={footer ? () => footer : undefined}
    />
  </>
);

export default MaterialListTable;
