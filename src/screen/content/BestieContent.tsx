import {
  Alert,
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
import {
  columnsResource,
  getTextEmpty,
  typedEntries,
} from "../../utils/common.util";
import CustomSlider from "../../components/CustomSlider";
import { BESTIE_TYPE } from "../../constants/InGame.constants";
import { TableResource } from "../../constants/Common.constants";
import ListingCard from "../../components/ListingCard";
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
            "* Growth only use one of the Bestie Star type, same for both Mount & Spirit"
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

    // stats
    let phyMagAtk = 0;
    let phyMagAtkPercent = 0;
    let attAtkPercent = 0;
    let fd = 0;
    // mount
    let crt = 0;
    let cdm = 0;
    let moveSpeedPercent = 0;
    // spirit
    let hp = 0;
    let hpPercent = 0;

    let errorMsg: string[] = [];

    temp.forEach((enhItem, idx) => {
      if (!enhItem || (!enhItem?.type && !enhItem?.listEnhance)) {
        errorMsg.push(`Nothing to calculate in Grow ${idx + 1}`);
      } else if (
        enhItem?.type &&
        enhItem?.listEnhance &&
        enhItem?.listEnhance.length > 0
      ) {
        enhItem?.listEnhance.forEach((item, i) => {
          if (!item || (!item?.version && !item?.range)) {
            errorMsg.push(
              `Nothing to calculate on Grow ${idx + 1} list ${i + 1}`
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

            // stats
            let tempArrStats: BestieStats[] = [];

            switch (item?.version) {
              case BestieVersion[0]:
                tempArrStats = isMount
                  ? BestieMountV1TableStats
                  : BestieSpiritV1TableStats;
                break;
              case BestieVersion[1]:
                tempArrStats = isMount
                  ? BestieMountV2TableStats
                  : BestieSpiritV2TableStats;
                break;

              default:
                break;
            }

            const dt1 =
              tempArrStats.length >= item?.range[0]
                ? tempArrStats[item?.range[0] - 1]
                : undefined;
            const dt2 =
              tempArrStats.length >= item?.range[1]
                ? tempArrStats[item?.range[1] - 1]
                : undefined;
            const minusHandler = (n1?: number, n2?: number) => {
              return (n1 ?? 0) - (n2 ?? 0);
            };

            if (dt2) {
              phyMagAtk += minusHandler(dt2.phyMagAtk, dt1?.phyMagAtk);
              phyMagAtkPercent += minusHandler(
                dt2.phyMagAtkPercent,
                dt1?.phyMagAtkPercent
              );
              attAtkPercent += minusHandler(
                dt2.attAtkPercent,
                dt1?.attAtkPercent
              );
              fd += minusHandler(dt2.fd, dt1?.fd);

              crt += minusHandler(dt2.crt, dt1?.crt);
              cdm += minusHandler(dt2.cdm, dt1?.cdm);
              moveSpeedPercent += minusHandler(
                dt2.moveSpeedPercent,
                dt1?.moveSpeedPercent
              );

              hp += minusHandler(dt2.hp, dt1?.hp);
              hpPercent += minusHandler(dt2.hpPercent, dt1?.hpPercent);
            }
          } else {
            let emsg = "";
            if (!item?.version) {
              emsg = "Version";
            } else if (!item?.range) {
              emsg = "Range";
            }
            errorMsg.push(
              `The ${emsg} in Grow ${idx + 1}, item ${
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
        errorMsg.push(`Empty ${msg} in Grow ${idx + 1}`);
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
        phyMagAtk,
        phyMagAtkPercent,
        attAtkPercent,
        fd,

        // mount
        crt,
        cdm,
        moveSpeedPercent,

        // spirit
        hp,
        hpPercent,
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
                      title={`Grow ${field.name + 1}`}
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
                          <Radio.Button value={BESTIE_TYPE.MNT}>
                            mount
                          </Radio.Button>
                          <Radio.Button value={BESTIE_TYPE.SPT}>
                            spirit
                          </Radio.Button>
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
          {enhanceDataSource.errorDt &&
            enhanceDataSource.errorDt.length > 0 && (
              <div style={{ marginTop: 4, maxWidth: getWidthSetting() }}>
                <Space direction="vertical" size={"small"}>
                  {enhanceDataSource.errorDt.map((it, x) => (
                    <Text type="warning" key={`error-label-${x}`}>
                      {it}
                    </Text>
                  ))}
                </Space>
              </div>
            )}
        </div>

        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Divider orientation="left">Growth Material List</Divider>
          {enhanceDataSource.errorDt && (
            <div>
              <Alert
                banner
                message="Some of the item you input is not valid"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={
              (enhanceDataSource.growthData
                ? typedEntries(enhanceDataSource.growthData).map(
                    ([key, value]) => ({
                      mats: key,
                      amount: value,
                    })
                  )
                : []) as TableResource[]
            }
            columns={columnsResource}
            pagination={false}
            bordered
            footer={() =>
              "* Growth only use one of the Bestie Star type, same for both Mount & Spirit"
            }
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <ListingCard
            title="Status Increase"
            data={[
              {
                title: "ATK",
                value: enhanceDataSource.statsData?.phyMagAtk,
                format: true,
              },
              {
                title: "ATK",
                value: enhanceDataSource.statsData?.phyMagAtkPercent,
                suffix: "%",
              },
              {
                title: "ATT",
                value: enhanceDataSource.statsData?.attAtkPercent,
                suffix: "%",
              },
              {
                title: "FD",
                value: enhanceDataSource.statsData?.fd,
                format: true,
              },
              {
                title: "CRT",
                value: enhanceDataSource.statsData?.crt,
                format: true,
              },
              {
                title: "CDM",
                value: enhanceDataSource.statsData?.cdm,
                format: true,
              },
              {
                title: "MvSpeed",
                value: enhanceDataSource.statsData?.moveSpeedPercent,
                suffix: "%",
              },
              {
                title: "HP",
                value: enhanceDataSource.statsData?.hp,
                format: true,
              },
              {
                title: "HP",
                value: enhanceDataSource.statsData?.hpPercent,
                suffix: "%",
              },
            ]}
          />
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
