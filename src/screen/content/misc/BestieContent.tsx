import {
  Alert,
  Button,
  Card,
  Collapse,
  CollapseProps,
  Divider,
  Form,
  Grid,
  Radio,
  Space,
  Typography,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  BestieGrowthTableMats,
  BestieMountV1TableStats,
  BestieMountV2TableStats,
  BestieSpiritV1TableStats,
  BestieSpiritV2TableStats,
} from "../../../data/misc/BestieCalculatorData";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import { EmptyCommonnStat } from "../../../constants/Common.constants";
import {
  combineEqStats,
  getComparedData,
  getStatDif,
} from "../../../utils/common.util";
import CustomSlider from "../../../components/CustomSlider";
import { BESTIE_TYPE } from "../../../constants/InGame.constants";
import ListingCard from "../../../components/ListingCard";
import MaterialListTable from "../../../components/MaterialListTable";
import MatsReferenceTables from "../../../components/MatsReferenceTables";
import StatReferenceTables from "../../../components/StatReferenceTables";
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface FormEnhance {
  type: BESTIE_TYPE | null;
  listEnhance: Array<{
    range?: [number, number] | null;
    version: string;
  }> | null;
}

const BestieVersion = ["v1", "v2", "v3"];

interface GrowthMaterialList {
  "Faded Bestie Star": number;
  "Shining Bestie Star": number;
  "Unbeatable Bestie Star": number;
}

interface GrowthTableRes {
  growthData?: GrowthMaterialList;
  statsData?: CommonItemStats;
  errorDt?: string[];
}

const mountFlags = {
  phyMagAtkFlag: true,
  phyMagAtkPercentFlag: true,
  attAtkPercentFlag: true,
  crtFlag: true,
  cdmFlag: true,
  fdFlag: true,
  moveSpeedPercentFlag: true,
};
const spiritFlags = {
  phyMagAtkFlag: true,
  phyMagAtkPercentFlag: true,
  attAtkPercentFlag: true,
  fdFlag: true,
  hpFlag: true,
  hpPercentFlag: true,
};

const BestieContent = () => {
  const screens = useBreakpoint();
  const [formEnhance] = Form.useForm<{ items: Array<FormEnhance> }>();
  const [enhanceDataSource, setEnhanceDataSource] = useState<GrowthTableRes>(
    {}
  );

  // Pure reference data — memoized so it isn't rebuilt (and reconciled,
  // since antd's Collapse keeps inactive panels mounted) on every keystroke
  // in the stateful "Grow" form below.
  const statsContent = useMemo(
    () => (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Divider orientation="left">Mount</Divider>
        <StatReferenceTables
          entries={[
            {
              key: "1",
              label: "1st",
              dataSource: BestieMountV1TableStats,
              flags: mountFlags,
            },
            {
              key: "2",
              label: "2nd & 3rd",
              dataSource: BestieMountV2TableStats,
              flags: mountFlags,
            },
          ]}
        />

        <Divider orientation="left">Spirit</Divider>
        <StatReferenceTables
          entries={[
            {
              key: "1",
              label: "1st",
              dataSource: BestieSpiritV1TableStats,
              flags: spiritFlags,
            },
            {
              key: "2",
              label: "2nd & 3rd",
              dataSource: BestieSpiritV2TableStats,
              flags: spiritFlags,
            },
          ]}
        />
      </div>
    ),
    []
  );

  const matsContent = useMemo(
    () => (
      <MatsReferenceTables
        entries={[
          {
            key: "1",
            label: "Bestie Star Growth",
            dataSource: BestieGrowthTableMats,
            fields: [
              { dataIndex: "faded", label: "Faded", shortLabel: "(Faded)" },
              { dataIndex: "shining", label: "Shining", shortLabel: "(Shining)" },
              {
                dataIndex: "unbeatable",
                label: "Unbeatable",
                shortLabel: "(Unbeatable)",
              },
            ],
            footer:
              "* Growth only use one of the Bestie Star type, same for both Mount & Spirit",
          },
        ]}
      />
    ),
    []
  );

  const calcEnhanceDataSource = (temp: Array<FormEnhance>) => {
    if (!temp || !Array.isArray(temp) || temp.length < 1) {
      return { errorDt: ["Empty List"] };
    }

    // mats
    let tempFaded = 0;
    let tempShining = 0;
    let tempUnbeat = 0;

    // stats
    let statsAcc: CommonItemStats = { ...EmptyCommonnStat };

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
            let tempArrStats: CommonItemStats[] = [];

            switch (item?.version) {
              case BestieVersion[0]:
                tempArrStats = isMount
                  ? BestieMountV1TableStats
                  : BestieSpiritV1TableStats;
                break;
              case BestieVersion[1]:
              case BestieVersion[2]:
                tempArrStats = isMount
                  ? BestieMountV2TableStats
                  : BestieSpiritV2TableStats;
                break;

              default:
                break;
            }

            const { dt1, dt2 } = getComparedData(
              tempArrStats,
              item.range[0],
              item.range[1]
            );
            if (dt2) {
              const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
              statsAcc = combineEqStats(statsAcc, dt, "add");
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
      statsData: { ...statsAcc, encLevel: "" },
      errorDt: errorMsg.length > 0 ? errorMsg : undefined,
    } as GrowthTableRes;
  };

  useEffect(() => {
    setEnhanceDataSource(
      calcEnhanceDataSource([{ type: null, listEnhance: null }])
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
                                          <Radio.Button key={it} value={it}>
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
          {enhanceDataSource.errorDt && (
            <div>
              <Alert
                banner
                message="Some of the item you input is not valid"
                type="warning"
              />
            </div>
          )}
          <MaterialListTable
            title="Growth Material List"
            data={enhanceDataSource.growthData ?? {}}
            footer="* Growth only use one of the Bestie Star type, same for both Mount & Spirit"
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <ListingCard
            title="Status Increase"
            data={getStatDif(enhanceDataSource.statsData)}
          />
        </div>
      </div>
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: statsContent,
    },
    {
      key: "2",
      label: "Resource",
      children: matsContent,
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
