import { Collapse, CollapseProps, theme, Typography } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { BDBaofaTalismanStatTable } from "../../data/BlackDragonTalismanData";
import { BDBaofaTalismanStat } from "../../interface/ItemStat.interface";
import { getColor, getTextEmpty } from "../../utils/common.util";
const { Text } = Typography;

const BlackDragonTalismanContent = () => {
  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();

  const columnsMats: ColumnsType<BDBaofaTalismanStat> = [
    {
      title: "Name",
      dataIndex: "name",
      responsive: ["sm"],
    },
    {
      title: "Stage Rarity",
      dataIndex: "rarity",
      width: 150,
      render: (_, { rarity }) => (
        <Text style={{ color: getColor(rarity, colorText) }}>{rarity}</Text>
      ),
    },
    {
      title: "MAX HP",
      responsive: ["sm"],
      width: 150,
      render: (_, { maxHP }) => <Text>{maxHP.toLocaleString()}</Text>,
    },
    {
      title: "MAX HP(%)",
      responsive: ["sm"],
      render: (_, { maxHPPercent }) => (
        <Text>{getTextEmpty({ txt: maxHPPercent, tailText: "%" })}</Text>
      ),
    },
    {
      title: "ATK (%)",
      responsive: ["sm"],
      render: (_, { attackPercent }) => (
        <Text>{getTextEmpty({ txt: attackPercent, tailText: "%" })}</Text>
      ),
    },
    {
      title: "Final Damage",
      dataIndex: "fd",
      responsive: ["sm"],
      render: (_, { fd }) => (
        <Text>{getTextEmpty({ txt: fd?.join(", ") })}</Text>
      ),
    },
    {
      title: "Craftable",
      dataIndex: "craftable",
      responsive: ["sm"],
      render: (_, { craftable }) => (
        <Text>{craftable ? "Craftable" : "Not craftable"}</Text>
      ),
    },
  ];

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Baofa",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ width: 500, marginRight: 10 }}>
            <Title level={5}>{"Stats"}</Title>
            <Table
              size={"small"}
              dataSource={BDBaofaTalismanStatTable}
              columns={columnsMats}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["2"]} />
    </div>
  );
};

export default BlackDragonTalismanContent;
