import { useEffect, useMemo, useState } from "react";
import EquipmentTable, {
  EquipmentTableCalculator,
} from "../../components/EquipmentTable";
import { BoneCalculator } from "../../interface/Common.interface";
import {
  BoneDragonEqEnhanceMaterialArmorTable,
  BoneDragonEqEnhanceMaterialWeapTable,
  BoneDragonStatsGlovesTable,
  BoneDragonStatsHelmTable,
  BoneDragonStatsLowerTable,
  BoneDragonStatsMainTable,
  BoneDragonStatsSecondTable,
  BoneDragonStatsShoesTable,
  BoneDragonStatsUpperTable,
  dataBoneCalculator,
} from "../../data/BoneDragonEqData";
import Collapse, { CollapseProps } from "antd/es/collapse";
import {
  BoneDragonStats,
  columnBoneDragonFlag,
} from "../../interface/ItemStat.interface";
import Table, { ColumnsType } from "antd/es/table";
import { getTextEmpty } from "../../utils/common.util";
import { Typography } from "antd";
import { BoneDragonEqEnhanceMaterial } from "../../interface/Item.interface";

const { Text } = Typography;

const BoneDragonEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<BoneCalculator[]>(dataBoneCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);

  const invalidDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found) {
        if (found.to <= found.from) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
          />
        </div>
      </div>
    );
  };

  const getStatContent = () => {
    const getColumnsStats = ({
      phyMagAtkMinFlag,
      phyMagAtkMaxFlag,
      phyMagAtkPercentFlag,
      attAtkPercentFlag,
      crtFlag,
      cdmFlag,
      fdFlag,
      defFlag,
      magdefFlag,
      hpFlag,
      hpPercentFlag,
      moveSpeedPercentFlag,
    }: columnBoneDragonFlag): ColumnsType<BoneDragonStats> => {
      const temp: ColumnsType<BoneDragonStats> = [];
      const smallItemTitle: string[] = [];
      if (phyMagAtkMinFlag && phyMagAtkMaxFlag) {
        smallItemTitle.push("ATK");
        temp.push({
          title: "Attack",
          responsive: ["sm"],
          render: (_, { phyMagAtkMin, phyMagAtkMax }) => (
            <div>
              <Text>
                {getTextEmpty({
                  txt:
                    phyMagAtkMin && phyMagAtkMax
                      ? `${phyMagAtkMin} - ${phyMagAtkMax}`
                      : undefined,
                })}
              </Text>
            </div>
          ),
        });
      }
      if (phyMagAtkPercentFlag) {
        smallItemTitle.push("ATK(%)");
        temp.push({
          title: "Attack(%)",
          responsive: ["sm"],
          render: (_, { phyMagAtkPercent }) => (
            <div>
              <Text>
                {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}
              </Text>
            </div>
          ),
        });
      }
      if (attAtkPercentFlag) {
        smallItemTitle.push("ATT(%)");
        temp.push({
          title: "Attribute(%)",
          responsive: ["sm"],
          render: (_, { attAtkPercent }) => (
            <div>
              <Text>{getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</Text>
            </div>
          ),
        });
      }
      if (crtFlag) {
        smallItemTitle.push("CRT");
        temp.push({
          title: "CRT",
          responsive: ["sm"],
          render: (_, { crt }) => (
            <div>
              <Text>{getTextEmpty({ txt: crt })}</Text>
            </div>
          ),
        });
      }
      if (cdmFlag) {
        smallItemTitle.push("CDM");
        temp.push({
          title: "CDM",
          responsive: ["sm"],
          render: (_, { cdm }) => (
            <div>
              <Text>{getTextEmpty({ txt: cdm })}</Text>
            </div>
          ),
        });
      }
      if (fdFlag) {
        smallItemTitle.push("FD");
        temp.push({
          title: "FD",
          responsive: ["sm"],
          render: (_, { fd }) => (
            <div>
              <Text>{getTextEmpty({ txt: fd })}</Text>
            </div>
          ),
        });
      }
      if (defFlag) {
        smallItemTitle.push("Phy Def");
        temp.push({
          title: "Phy Def",
          responsive: ["sm"],
          render: (_, { def }) => (
            <div>
              <Text>{getTextEmpty({ txt: def })}</Text>
            </div>
          ),
        });
      }
      if (magdefFlag) {
        smallItemTitle.push("Mag Def");
        temp.push({
          title: "Mag Def",
          responsive: ["sm"],
          render: (_, { magdef }) => (
            <div>
              <Text>{getTextEmpty({ txt: magdef })}</Text>
            </div>
          ),
        });
      }
      if (hpFlag) {
        smallItemTitle.push("HP");
        temp.push({
          title: "HP",
          responsive: ["sm"],
          render: (_, { hp }) => (
            <div>
              <Text>{getTextEmpty({ txt: hp })}</Text>
            </div>
          ),
        });
      }
      if (hpPercentFlag) {
        smallItemTitle.push("HP(%)");
        temp.push({
          title: "HP(%)",
          responsive: ["sm"],
          render: (_, { hpPercent }) => (
            <div>
              <Text>{getTextEmpty({ txt: hpPercent, tailText: "%" })}</Text>
            </div>
          ),
        });
      }
      if (moveSpeedPercentFlag) {
        smallItemTitle.push("Movespeed(%)");
        temp.push({
          title: "Movespeed(%)",
          responsive: ["sm"],
          render: (_, { moveSpeedPercent }) => (
            <div>
              <Text>
                {getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}
              </Text>
            </div>
          ),
        });
      }

      return [
        {
          title: "Enhancement",
          dataIndex: "encLevel",
        },
        {
          title: (
            <div>
              {smallItemTitle.map((it) => (
                <p key={`title-${it}`}>{it}</p>
              ))}
            </div>
          ),
          responsive: ["xs"],
          width: 150,
          render: (
            _,
            {
              phyMagAtkMin,
              phyMagAtkMax,
              phyMagAtkPercent,
              attAtkPercent,
              crt,
              cdm,
              fd,
              def,
              magdef,
              hp,
              hpPercent,
              moveSpeedPercent,
            }
          ) => (
            <div>
              {phyMagAtkMinFlag && phyMagAtkMaxFlag && (
                <p>
                  ATK{" "}
                  {getTextEmpty({
                    txt:
                      phyMagAtkMin && phyMagAtkMax
                        ? `${phyMagAtkMin} - ${phyMagAtkMax}`
                        : undefined,
                  })}
                </p>
              )}
              {phyMagAtkPercentFlag && (
                <p>
                  ATK {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}
                </p>
              )}
              {attAtkPercentFlag && (
                <p>Ele {getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</p>
              )}
              {crtFlag && <p>CRT {getTextEmpty({ txt: crt })}</p>}
              {cdmFlag && <p>CDM {getTextEmpty({ txt: cdm })}</p>}
              {fdFlag && <p>FD {getTextEmpty({ txt: fd })}</p>}
              {defFlag && <p>Phy Def {getTextEmpty({ txt: def })}</p>}
              {magdefFlag && <p>Mag Def {getTextEmpty({ txt: magdef })}</p>}
              {hpFlag && <p>HP {getTextEmpty({ txt: hp })}</p>}
              {hpPercentFlag && (
                <p>HP {getTextEmpty({ txt: hpPercent, tailText: "%" })}</p>
              )}
              {moveSpeedPercentFlag && (
                <p>
                  Movespeed{" "}
                  {getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}
                </p>
              )}
            </div>
          ),
        },
        ...temp,
      ];
    };

    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Armor",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Helm"}
              size={"small"}
              dataSource={BoneDragonStatsHelmTable}
              columns={getColumnsStats({
                phyMagAtkMinFlag: true,
                phyMagAtkMaxFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
                defFlag: true,
                magdefFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
                moveSpeedPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Upper"}
              size={"small"}
              dataSource={BoneDragonStatsUpperTable}
              columns={getColumnsStats({})}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Lower"}
              size={"small"}
              dataSource={BoneDragonStatsLowerTable}
              columns={getColumnsStats({})}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Glove"}
              size={"small"}
              dataSource={BoneDragonStatsGlovesTable}
              columns={getColumnsStats({})}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Shoes"}
              size={"small"}
              dataSource={BoneDragonStatsShoesTable}
              columns={getColumnsStats({})}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "2",
        label: "Weapon",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Main"}
              size={"small"}
              dataSource={BoneDragonStatsMainTable}
              columns={getColumnsStats({})}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Second"}
              size={"small"}
              dataSource={BoneDragonStatsSecondTable}
              columns={getColumnsStats({})}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Collapse items={itemStat} size="small" />
      </div>
    );
  };

  const getMatsContent = () => {
    const columnsMats: ColumnsType<BoneDragonEqEnhanceMaterial> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Bone Fragment</p>
            <p>Garnet</p>
            <p>Essence</p>
            <p>Gold</p>
            <p>Jelly</p>
            <p>Success Rate</p>
            <p>Break Rate</p>
            <p>Fail Deduction</p>
          </div>
        ),
        responsive: ["xs"],
        render: (
          _,
          {
            boneFragment,
            garnet,
            essence,
            gold,
            jelly,
            successRatePercent,
            breakNoJellyPercent,
            enhanceFailDeduction,
          }
        ) => (
          <div>
            <p>{getTextEmpty({ txt: boneFragment })}(Bone Fragment)</p>
            <p>{getTextEmpty({ txt: garnet })}(Garnet)</p>
            <p>{getTextEmpty({ txt: essence })}(Essence)</p>
            <p>{getTextEmpty({ txt: gold })}(g)</p>
            <p>{getTextEmpty({ txt: jelly })}(Jelly)</p>
            <p>
              {getTextEmpty({ txt: successRatePercent, tailText: "%" })}
              (Success%)
            </p>
            <p>
              {getTextEmpty({ txt: breakNoJellyPercent, tailText: "%" })}
              (Break%)
            </p>
            <p>
              {getTextEmpty({ txt: enhanceFailDeduction })}
              (Deduct)
            </p>
          </div>
        ),
      },
      // {
      //   title: "Eq. Fragment",
      //   dataIndex: "eqTypeFragment",
      //   responsive: ["sm"],
      // },
      // {
      //   title: "A. Knowledge",
      //   dataIndex: "ancKnowledge",
      //   responsive: ["sm"],
      // },
      // {
      //   title: "A. Insignia",
      //   dataIndex: "ancInsignia",
      //   responsive: ["sm"],
      // },
      {
        title: "Gold",
        dataIndex: "gold",
        responsive: ["sm"],
      },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Table
          style={{ marginRight: 10, marginBottom: 10 }}
          title={() => "Main"}
          size={"small"}
          dataSource={BoneDragonEqEnhanceMaterialArmorTable}
          columns={columnsMats}
          pagination={false}
          bordered
        />
        <Table
          style={{ marginRight: 10, marginBottom: 10 }}
          title={() => "Second"}
          size={"small"}
          dataSource={BoneDragonEqEnhanceMaterialWeapTable}
          columns={columnsMats}
          pagination={false}
          bordered
        />
      </div>
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: getStatContent(),
    },
    {
      key: "2",
      label: "Mats",
      children: getMatsContent(),
    },
    {
      key: "3",
      label: "Calculate",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default BoneDragonEqContent;
