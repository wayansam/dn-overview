import { Collapse, CollapseProps, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useRef } from "react";
import SkillJadeCalcComp from "../../components/SkillJadeCalcComp";
import {
  AncientDJSkillMaterialTable,
  AncientDJSkillStatTable,
  DimeOtherDJSkillMaterialTable,
  DimeOtherDJSkillStatTable,
  DMFDJSkillMaterialTable,
  DMFDJSkillStatTable,
} from "../../data/SkillJadeData";
import { useAppSelector } from "../../hooks";
import { SkillJadeEnhanceMaterial } from "../../interface/Item.interface";
import { SkillJadeStat } from "../../interface/ItemStat.interface";
import { getTextEmpty } from "../../utils/common.util";

const { Text } = Typography;

const SkillJadeContent = () => {
  const skillJadeScreen = useAppSelector(
    (state) => state.UIState.selectedSideBar.payload?.skillJadeScreen
  );
  const activeKey = useRef(skillJadeScreen?.tabOpen || ["8"]);
  const getColumnsStats = (showCd?: boolean): ColumnsType<SkillJadeStat> => {
    const cdData: ColumnsType<SkillJadeStat> = showCd
      ? [
          {
            title: "Cooldown Decrease",
            responsive: ["sm"],
            render: (_, { cooldownPercent }) => (
              <div>
                <Text>Cd -{cooldownPercent}%</Text>
              </div>
            ),
          },
        ]
      : [];
    const dt: ColumnsType<SkillJadeStat> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <Text>Attack Percentage</Text>
            {showCd && <Text>Cooldown Decrease</Text>}
            <Text>Success Rate</Text>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { attackPercent, cooldownPercent, successRate }) => (
          <div>
            <p>ATK {attackPercent}%</p>
            {showCd && <p>Cd -{cooldownPercent}%</p>}
            <p>Success: {successRate}%</p>
          </div>
        ),
      },
      {
        title: "Attack Percentage",
        responsive: ["sm"],
        render: (_, { attackPercent }) => (
          <div>
            <Text style={{ margin: 0 }}>ATK {attackPercent}%</Text>
          </div>
        ),
      },
    ];

    const sRate: ColumnsType<SkillJadeStat> = [
      {
        title: "Success Rate",
        responsive: ["sm"],
        render: (_, { successRate }) => (
          <div>
            <Text style={{ margin: 0 }}>{successRate}%</Text>
          </div>
        ),
      },
    ];

    return [...dt, ...cdData, ...sRate];
  };

  const getColumnsMats = (): ColumnsType<SkillJadeEnhanceMaterial> => {
    const dt: ColumnsType<SkillJadeEnhanceMaterial> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <Text>Core</Text>
            <Text>Success Rate</Text>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { lowerFragment, higherFragment, gold }) => (
          <div>
            <p>{getTextEmpty({ txt: lowerFragment })}(core)</p>
            <p>{getTextEmpty({ txt: higherFragment })}(hg core)</p>
            <p>{getTextEmpty({ txt: gold })}(g)</p>
          </div>
        ),
      },
      {
        title: "Core",
        responsive: ["sm"],
        render: (_, { lowerFragment }) => (
          <Text>
            {getTextEmpty({
              txt: lowerFragment,
            })}
          </Text>
        ),
      },
      {
        title: "HG Core",
        responsive: ["sm"],
        render: (_, { higherFragment }) => (
          <Text>
            {getTextEmpty({
              txt: higherFragment,
            })}
          </Text>
        ),
      },
      {
        title: "Gold",
        responsive: ["sm"],
        render: (_, { gold }) => (
          <Text>
            {getTextEmpty({
              txt: gold,
            })}
          </Text>
        ),
      },
    ];

    return dt;
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Skill Jade Stat Table",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>
              {"Dreamy / Blood Moon / Verdure Dragon Jade"}
            </Title>
            <Table
              size={"small"}
              dataSource={DMFDJSkillStatTable}
              columns={getColumnsStats(true)}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>{"Ancient Dragon Jade"}</Title>
            <Table
              size={"small"}
              dataSource={AncientDJSkillStatTable}
              columns={getColumnsStats()}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>{"Dimensional / Otherworldly Dragon Jade"}</Title>
            <Table
              size={"small"}
              dataSource={DimeOtherDJSkillStatTable}
              columns={getColumnsStats(true)}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Skill Jade Mat Table",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>
              {"Dreamy / Blood Moon / Verdure Dragon Jade"}
            </Title>
            <Table
              size={"small"}
              dataSource={DMFDJSkillMaterialTable}
              columns={getColumnsMats()}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>{"Ancient Dragon Jade"}</Title>
            <Table
              size={"small"}
              dataSource={AncientDJSkillMaterialTable}
              columns={getColumnsMats()}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>{"Dimensional / Otherworldly Dragon Jade"}</Title>
            <Table
              size={"small"}
              dataSource={DimeOtherDJSkillMaterialTable}
              columns={getColumnsMats()}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Dreamy Dragon Jade",
      children: (
        <SkillJadeCalcComp
          matsTable={DMFDJSkillMaterialTable}
          statsTable={DMFDJSkillStatTable}
          lFragName={"Dreamy Core"}
          hFragName={"High Purity Dreamy Core"}
        />
      ),
    },
    {
      key: "4",
      label: "Blood Moon Dragon Jade",
      children: (
        <SkillJadeCalcComp
          matsTable={DMFDJSkillMaterialTable}
          statsTable={DMFDJSkillStatTable}
          lFragName={"Blood Moon Core"}
          hFragName={"High Purity Blood Moon Core"}
        />
      ),
    },
    {
      key: "5",
      label: "Verdure Dragon Jade",
      children: (
        <SkillJadeCalcComp
          matsTable={DMFDJSkillMaterialTable}
          statsTable={DMFDJSkillStatTable}
          lFragName={"Verdure Core"}
          hFragName={"High Purity Verdure Core"}
        />
      ),
    },
    {
      key: "6",
      label: "Ancient Dragon Jade",
      children: (
        <SkillJadeCalcComp
          matsTable={AncientDJSkillMaterialTable}
          statsTable={AncientDJSkillStatTable}
          lFragName={"Ancient Broken Dragon Jade Fragments"}
          hFragName={"Ancient Dragon Jade Fragments"}
          hideCD
          hideTH
        />
      ),
    },
    {
      key: "7",
      label: "Dimensional Dragon Jade",
      children: (
        <SkillJadeCalcComp
          matsTable={DimeOtherDJSkillMaterialTable}
          statsTable={DimeOtherDJSkillStatTable}
          lFragName={"Dimensional Core"}
          hFragName={"High Purity Dimensional Core"}
        />
      ),
    },
    {
      key: "8",
      label: "Otherworldly Dragon Jade",
      children: (
        <SkillJadeCalcComp
          matsTable={DimeOtherDJSkillMaterialTable}
          statsTable={DimeOtherDJSkillStatTable}
          lFragName={"Otherworldly Core"}
          hFragName={"High Purity Otherworldly Core"}
        />
      ),
    },
  ];

  return (
    <div>
      <Collapse
        items={items}
        size="small"
        defaultActiveKey={activeKey.current}
      />
    </div>
  );
};

export default SkillJadeContent;
