import {
  Button,
  Card,
  Collapse,
  CollapseProps,
  Divider,
  Form,
  Grid,
  InputNumber,
  Radio,
  Space,
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
import CustomSlider from "../../components/CustomSlider";
import { BESTIE_TYPE } from "../../constants/InGame.constants";
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface FormEnhance {
  type: BESTIE_TYPE;
  listEnhance: Array<{
    range?: [number, number] | null;
    version: string;
  }> | null;
}

const BestieVersion = ["v1", "v2"];

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

    // mats
    let tempFaded = 0;
    let tempShining = 0;
    let tempUnbeat = 0;

    let errorMsg: string[] = [];

    console.log({ temp });

    temp.forEach((enhItem, idx) => {
      if (!enhItem || (!enhItem?.type && !enhItem?.listEnhance)) {
        errorMsg.push(`Nothing to calculate in Enhance ${idx + 1}`);
      } else if (
        enhItem?.type &&
        enhItem?.listEnhance &&
        enhItem?.listEnhance.length > 0
      ) {
        enhItem?.listEnhance.forEach((item, i) => {
          if (!item || (!item?.version && !item?.range)) {
            errorMsg.push(
              `Nothing to calculate on Enhance ${idx + 1} list ${i + 1}`
            );
          } else if (item?.version && item?.range) {
            // mats
            let tempFadedC = 0;
            let tempShiningC = 0;
            let tempUnbeatC = 0;

            const isMount = enhItem?.type === BESTIE_TYPE.MNT;

            const tempSliceMats = BestieGrowthTableMats.slice(
              item?.range[0],
              item?.range[1]
            );
            tempSliceMats.forEach((slicedItem) => {
              tempFadedC += slicedItem.faded;
              tempShiningC += slicedItem.shining;
              tempUnbeatC += slicedItem.unbeatable;
            });

            tempFaded += tempFadedC;
            tempShining += tempShiningC;
            tempUnbeat += tempUnbeatC;
          } else {
            let emsg = "";
            if (!item?.version) {
              emsg = "Version";
            } else if (!item?.range) {
              emsg = "Range";
            }
            errorMsg.push(
              `The ${emsg} in Enhance ${idx + 1}, item ${
                i + 1
              } haven't inputted properly`
            );
          }
        });
      } else {
        let msg = "";
        if (!enhItem?.type) {
          msg = "Type";
        } else if (!enhItem?.listEnhance || enhItem?.listEnhance.length === 0) {
          msg = "List";
        }
        errorMsg.push(`Empty ${msg} in Enhance ${idx + 1}`);
      }
    });

    return {
      growthData: {
        "Faded Bestie Star": tempFaded,
        "Shining Bestie Star": tempShining,
        "Unbeatable Bestie Star": tempUnbeat,
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
        { type: BESTIE_TYPE.MNT, listEnhance: null },
        { type: BESTIE_TYPE.SPT, listEnhance: null },
      ])
    );
  }, []);

  const onValuesChange = (_: any, allValues: { items: Array<FormEnhance> }) => {
    setEnhanceDataSource(calcEnhanceDataSource(allValues.items));
  };
  console.log({ enhanceDataSource });

  const getWidthSetting = () => {
    if (screens.xs) {
      return 200;
    }
    return 400;
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

                      <Form.Item label="List">
                        <Form.List name={[field.name, "listEnhance"]}>
                          {(subFields, subOpt) => (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                rowGap: 18,
                              }}
                            >
                              {subFields.map((subField, idx) => (
                                <Card
                                  key={subField.key}
                                  size="small"
                                  style={{ width: "100%" }}
                                  id={`${subField.name}-card-${idx}`}
                                >
                                  <Space
                                    direction="horizontal"
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      flexDirection: "row",
                                      borderWidth: 1,
                                    }}
                                  >
                                    <Form.Item
                                      label="Version"
                                      name={[subField.name, "version"]}
                                      rules={[{ required: true }]}
                                      id={`${subField.name}-version-${idx}`}
                                    >
                                      <Radio.Group>
                                        {BestieVersion.map((it) => (
                                          <Radio.Button value={it}>
                                            {it.toUpperCase()}
                                          </Radio.Button>
                                        ))}
                                      </Radio.Group>
                                    </Form.Item>

                                    <CloseOutlined
                                      onClick={() => {
                                        subOpt.remove(subField.name);
                                      }}
                                    />
                                  </Space>

                                  <Form.Item
                                    noStyle
                                    name={[subField.name, "range"]}
                                  >
                                    <CustomSlider
                                      id={`${subField.name}-range-${idx}`}
                                      max={30}
                                      mark={{
                                        0: "+0",
                                        10: "+10",
                                        20: "+20",
                                        30: "+30",
                                      }}
                                    />
                                  </Form.Item>
                                </Card>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => subOpt.add()}
                                block
                                disabled={
                                  subFields &&
                                  subFields.length >= BestieVersion.length
                                }
                              >
                                + Add Enhancement
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    disabled={fields && fields.length >= 2}
                  >
                    + Add Type
                  </Button>
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
