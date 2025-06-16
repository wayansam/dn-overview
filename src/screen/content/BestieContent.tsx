import {
  Card,
  Collapse,
  CollapseProps,
  Divider,
  Form,
  Grid,
  Radio,
  Table,
  Typography,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BestieGrowthTableMats,
  BestieMountV1TableStats,
  BestieMountV2TableStats,
  BestieSpiritV1TableStats,
  BestieSpiritV2TableStats,
} from "../../data/BestieCalculatorData";
import { ColumnsType } from "antd/es/table";
import { BestieStats } from "../../interface/ItemStat.interface";
import { getTextEmpty } from "../../utils/common.util";
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface FormEnhance {
  type: "mount" | "spirit";
  listEnhance: Array<{
    range?: [number, number] | null;
    ver: number;
  }> | null;
}

interface GrowthMaterialList {
  "Faded Bestie Star": number;
  "Shining Bestie Star": number;
  "Unbeatable Bestie Star": number;
}

interface GrowthTableRes {
  growthData?: GrowthMaterialList;
  statsData?: BestieStats;
  errorDt?: string[];
}

const BestieContent = () => {
  const screens = useBreakpoint();
  const [formEnhance] = Form.useForm<{ items: Array<FormEnhance> }>();
  const [enhanceDataSource, setEnhanceDataSource] = useState<GrowthTableRes>(
    {}
  );

  const getStats = () => {
    const colMount: ColumnsType<BestieStats> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            {[
              "ATK",
              "ATK(%)",
              "ATT(%)",
              "CRT",
              "CDM",
              "FD",
              "Movespeed(%)",
            ].map((it) => (
              <p key={`title-${it}`}>{it}</p>
            ))}
          </div>
        ),
        responsive: ["xs"],
        width: 150,
        render: (
          _,
          {
            phyMagAtk,
            phyMagAtkPercent,
            attAtkPercent,
            crt,
            cdm,
            fd,
            moveSpeedPercent,
          }
        ) => (
          <div>
            <p>ATK {getTextEmpty({ txt: phyMagAtk })}</p>(
            <p>ATK {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}</p>)
            <p>Ele {getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</p>
            <p>CRT {getTextEmpty({ txt: crt })}</p>
            <p>CDM {getTextEmpty({ txt: cdm })}</p>
            <p>FD {getTextEmpty({ txt: fd })}</p>
            <p>
              Movespeed {getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}
            </p>
          </div>
        ),
      },
      {
        title: "Attack",
        responsive: ["sm"],
        render: (_, { phyMagAtk }) => (
          <div>
            <Text>{getTextEmpty({ txt: phyMagAtk })}</Text>
          </div>
        ),
      },
      {
        title: "Attack(%)",
        responsive: ["sm"],
        render: (_, { phyMagAtkPercent }) => (
          <div>
            <Text>
              {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}
            </Text>
          </div>
        ),
      },
      {
        title: "Attribute(%)",
        responsive: ["sm"],
        render: (_, { attAtkPercent }) => (
          <div>
            <Text>{getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</Text>
          </div>
        ),
      },
      {
        title: "CRT",
        responsive: ["sm"],
        render: (_, { crt }) => (
          <div>
            <Text>{getTextEmpty({ txt: crt })}</Text>
          </div>
        ),
      },
      {
        title: "CDM",
        responsive: ["sm"],
        render: (_, { cdm }) => (
          <div>
            <Text>{getTextEmpty({ txt: cdm })}</Text>
          </div>
        ),
      },
      {
        title: "FD",
        responsive: ["sm"],
        render: (_, { fd }) => (
          <div>
            <Text>{getTextEmpty({ txt: fd })}</Text>
          </div>
        ),
      },
      {
        title: "Movespeed(%)",
        responsive: ["sm"],
        render: (_, { moveSpeedPercent }) => (
          <div>
            <Text>
              {getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}
            </Text>
          </div>
        ),
      },
    ];

    const colSpirit: ColumnsType<BestieStats> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            {["ATK", "ATK(%)", "ATT(%)", "FD", "HP", "HP(%)"].map((it) => (
              <p key={`title-${it}`}>{it}</p>
            ))}
          </div>
        ),
        responsive: ["xs"],
        width: 150,
        render: (
          _,
          { phyMagAtk, phyMagAtkPercent, attAtkPercent, fd, hp, hpPercent }
        ) => (
          <div>
            <p>ATK {getTextEmpty({ txt: phyMagAtk })}</p>(
            <p>ATK {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}</p>)
            <p>Ele {getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</p>
            <p>FD {getTextEmpty({ txt: fd })}</p>
            <p>HP {getTextEmpty({ txt: hp })}</p>
            <p>HP {getTextEmpty({ txt: hpPercent, tailText: "%" })}</p>
          </div>
        ),
      },
      {
        title: "Attack",
        responsive: ["sm"],
        render: (_, { phyMagAtk }) => (
          <div>
            <Text>{getTextEmpty({ txt: phyMagAtk })}</Text>
          </div>
        ),
      },
      {
        title: "Attack(%)",
        responsive: ["sm"],
        render: (_, { phyMagAtkPercent }) => (
          <div>
            <Text>
              {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}
            </Text>
          </div>
        ),
      },
      {
        title: "Attribute(%)",
        responsive: ["sm"],
        render: (_, { attAtkPercent }) => (
          <div>
            <Text>{getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</Text>
          </div>
        ),
      },
      {
        title: "FD",
        responsive: ["sm"],
        render: (_, { fd }) => (
          <div>
            <Text>{getTextEmpty({ txt: fd })}</Text>
          </div>
        ),
      },
      {
        title: "HP",
        responsive: ["sm"],
        render: (_, { hp }) => (
          <div>
            <Text>{getTextEmpty({ txt: hp })}</Text>
          </div>
        ),
      },
      {
        title: "HP(%)",
        responsive: ["sm"],
        render: (_, { hpPercent }) => (
          <div>
            <Text>{getTextEmpty({ txt: hpPercent, tailText: "%" })}</Text>
          </div>
        ),
      },
    ];

    const itemStatMount: CollapseProps["items"] = [
      {
        key: "1",
        label: "1st",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              size={"small"}
              dataSource={BestieMountV1TableStats}
              columns={colMount}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "2",
        label: "2nd",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              size={"small"}
              dataSource={BestieMountV2TableStats}
              columns={colMount}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
    ];

    const itemStatSpirit: CollapseProps["items"] = [
      {
        key: "1",
        label: "1st",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              size={"small"}
              dataSource={BestieSpiritV1TableStats}
              columns={colSpirit}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "2",
        label: "2nd",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              size={"small"}
              dataSource={BestieSpiritV2TableStats}
              columns={colSpirit}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Divider orientation="left">Mount</Divider>
        <Collapse items={itemStatMount} size="small" />

        <Divider orientation="left">Spirit</Divider>
        <Collapse items={itemStatSpirit} size="small" />
      </div>
    );
  };
  const getMats = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Table
          style={{ marginRight: 10, marginBottom: 10 }}
          size={"small"}
          dataSource={BestieGrowthTableMats}
          columns={[
            {
              title: "Enhancement",
              dataIndex: "encLevel",
            },
            {
              title: "Faded",
              dataIndex: "faded",
            },
            {
              title: "Shining",
              dataIndex: "shining",
            },
            {
              title: "Unbeatable",
              dataIndex: "unbeatable",
            },
          ]}
          pagination={false}
          bordered
          footer={() =>
            "* Mats use one of the Bestie Star type only, not all. Same for both Mount & Spirit"
          }
        />
      </div>
    );
  };

  const calcEnhanceDataSource = (temp: Array<FormEnhance>) => {
    if (!temp || !Array.isArray(temp) || temp.length < 1) {
      return { errorDt: ["Empty List"] };
    }
    let errorMsg: string[] = [];

    return {
      growthData: {
        "Faded Bestie Star": 0,
        "Shining Bestie Star": 0,
        "Unbeatable Bestie Star": 0,
      },
      statsData: {
        encLevel: "",
        phyMagAtk: 0,
        phyMagAtkPercent: 0,
        attAtkPercent: 0,
        fd: 0,

        // mount
        crt: 0,
        cdm: 0,
        moveSpeedPercent: 0,

        // spirit
        hp: 0,
        hpPercent: 0,
      },
      errorDt: errorMsg.length > 0 ? errorMsg : undefined,
    } as GrowthTableRes;
  };

  useEffect(() => {
    setEnhanceDataSource(
      calcEnhanceDataSource([
        { type: "mount", listEnhance: null },
        { type: "spirit", listEnhance: null },
      ])
    );
  }, []);

  const onValuesChange = (_: any, allValues: { items: Array<FormEnhance> }) => {
    setEnhanceDataSource(calcEnhanceDataSource(allValues.items));
  };

  const getWidthSetting = () => {
    if (screens.xs) {
      return 200;
    }
    return 320;
  };

  const getEnhanceCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Divider orientation="left">Grow List</Divider>
          <Form
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            form={formEnhance}
            name="dynamic_form_complex"
            style={{ maxWidth: 600 }}
            autoComplete="off"
            initialValues={{ items: [{}] }}
            onValuesChange={onValuesChange}
          >
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <div
                  style={{
                    display: "flex",
                    rowGap: 16,
                    flexDirection: "column",
                  }}
                >
                  {fields.map((field, index) => (
                    <Card
                      size="small"
                      title={`Enhance ${field.name + 1}`}
                      style={{ minWidth: getWidthSetting() }}
                      key={field.key}
                      id={`${field.name}-card-${index}`}
                      extra={
                        <CloseOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      }
                    >
                      <Form.Item
                        label="Type"
                        name={[field.name, "type"]}
                        rules={[{ required: true }]}
                        id={`${field.name}-type-${index}`}
                      >
                        <Radio.Group>
                          <Radio.Button value={"mount"}>mount</Radio.Button>
                          <Radio.Button value={"spirit"}>spirit</Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    </Card>
                  ))}
                </div>
              )}
            </Form.List>
          </Form>
        </div>
      </div>
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: getStats(),
    },
    {
      key: "2",
      label: "Resource",
      children: getMats(),
    },
    {
      key: "3",
      label: "Grow",
      children: getEnhanceCalculator(),
    },
  ];

  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default BestieContent;
