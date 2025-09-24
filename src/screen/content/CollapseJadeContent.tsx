import { CloseOutlined } from "@ant-design/icons";
import type { CollapseProps } from "antd";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Form,
  Grid,
  InputNumber,
  Radio,
  Space,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import CustomSlider from "../../components/CustomSlider";
import ListingCard from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import {
  EmptyCommonnStat,
  TableResource,
} from "../../constants/Common.constants";
import { COLLAPSE_JADE_TYPE } from "../../constants/InGame.constants";
import { CollapseJadeCraftEnhanceMaterial } from "../../interface/Item.interface";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  columnsResource,
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
  getTextEmpty,
  multiplyEqStats,
  typedEntries,
} from "../../utils/common.util";
import {
  CollapseJadeAttackStatsTable,
  CollapseJadeCraftMats,
  CollapseJadeDefendStatsTable,
  CollapseJadeEnhanceMatsTable,
} from "../../data/CollapseJadeData";

const { useBreakpoint } = Grid;
const { Text } = Typography;

interface FormEnhance {
  type: string | null;
  listEnhance: Array<{
    range?: [number, number] | null;
    amt?: number | null;
    craft?: boolean | null;
  }> | null;
}

interface EnhanceTableMaterialList {
  "Collapse Dragon Jade Fragment": number;
  "Ancient's Foundation Stone": number;
  "Dimensional Vestige": number;
  Gold: number;
}

interface MatsTableRes {
  matsData?: EnhanceTableMaterialList;
  statsData?: CommonItemStats;
  errorDt?: string[];
}

const CollapseJadeContent = () => {
  const screens = useBreakpoint();

  const [formEnhance] = Form.useForm<{ items: Array<FormEnhance> }>();

  const [enhanceDataSource, setEnhanceDataSource] = useState<MatsTableRes>({});

  const getMatsCol = (): ColumnsType<CollapseJadeCraftEnhanceMaterial> => {
    return [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Collapse Fragment</p>
            <p>Foundation Stone</p>
            <p>Dim. Vestige</p>
            <p>Gold</p>
          </div>
        ),
        responsive: ["xs"],
        render: (
          _,
          { collapseFragment, foundationStone, dimVestige, gold }
        ) => (
          <div>
            <p>{getTextEmpty({ txt: collapseFragment })}(frag)</p>
            <p>{getTextEmpty({ txt: foundationStone })}(stone)</p>
            <p>{getTextEmpty({ txt: dimVestige })}(d.ves)</p>
            <p>{getTextEmpty({ txt: gold })}(g)</p>
          </div>
        ),
      },
      {
        title: "Collapse Fragment",
        responsive: ["sm"],
        render: (_, { collapseFragment }) => (
          <Text>
            {getTextEmpty({
              txt: collapseFragment,
            })}
          </Text>
        ),
      },
      {
        title: "Foundation Stone",
        responsive: ["sm"],
        render: (_, { foundationStone }) => (
          <Text>
            {getTextEmpty({
              txt: foundationStone,
            })}
          </Text>
        ),
      },
      {
        title: "Dim. Vestige",
        responsive: ["sm"],
        render: (_, { dimVestige }) => (
          <Text>
            {getTextEmpty({
              txt: dimVestige,
            })}
          </Text>
        ),
      },
      {
        title: "Gold",
        dataIndex: "gold",
        responsive: ["sm"],
        render: (_, { gold }) => <Text>{gold.toLocaleString()}</Text>,
      },
    ];
  };

  const calcEnhanceDataSource = (temp: Array<FormEnhance>) => {
    if (!temp || !Array.isArray(temp) || temp.length < 1) {
      return { errorDt: ["Empty List"] };
    }
    // mats
    let tempCollapseFragment = 0;
    let tempFoundationStone = 0;
    let tempDimVestige = 0;
    let tempGold = 0;

    // stats
    let tempStat: CommonItemStats = { ...EmptyCommonnStat };

    let errorMsg: string[] = [];

    temp.forEach((enhItem, idx) => {
      if (!enhItem || (!enhItem?.type && !enhItem?.listEnhance)) {
        errorMsg.push(`Nothing to calculate in Enhance ${idx + 1}`);
      } else if (
        enhItem?.type &&
        enhItem?.listEnhance &&
        enhItem?.listEnhance.length > 0
      ) {
        enhItem?.listEnhance.forEach((item, i) => {
          if (!item || !item?.amt) {
            errorMsg.push(
              `Nothing to calculate on Enhance ${idx + 1} list ${i + 1}`
            );
          } else if (item?.amt) {
            // mats
            const range = item?.range ?? [0, 0];
            const { collapseFragment, foundationStone, dimVestige, gold } =
              CollapseJadeCraftMats;
            let tempCollapseFragmentC = item?.craft ? collapseFragment : 0;
            let tempFoundationStoneC = item?.craft ? foundationStone : 0;
            let tempDimVestigeC = item?.craft ? dimVestige : 0;
            let tempGoldC = item?.craft ? gold : 0;

            const isAtt = enhItem?.type === COLLAPSE_JADE_TYPE.ATT;

            const tempSliceMats = CollapseJadeEnhanceMatsTable.slice(
              range[0],
              range[1]
            );

            tempSliceMats.forEach((slicedItem) => {
              tempCollapseFragmentC += slicedItem.collapseFragment;
              tempFoundationStoneC += slicedItem.foundationStone;
              tempDimVestigeC += slicedItem.dimVestige;
              tempGoldC += slicedItem.gold;
            });

            tempCollapseFragment += tempCollapseFragmentC * item?.amt;
            tempFoundationStone += tempFoundationStoneC * item?.amt;
            tempDimVestige += tempDimVestigeC * item?.amt;
            tempGold += tempGoldC * item?.amt;

            // stats
            const tempArrStats = isAtt
              ? CollapseJadeAttackStatsTable
              : CollapseJadeDefendStatsTable;

            const { dt1, dt2 } = getComparedData(
              tempArrStats,
              range[0] + 1,
              range[1] + 1
            );
            if (dt2) {
              const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
              const dtn = multiplyEqStats(dt, item?.amt);
              tempStat = combineEqStats(tempStat, dtn, "add");
            }
          } else {
            let emsg = "";
            if (!item?.amt) {
              emsg = "Amount";
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
      matsData: {
        "Collapse Dragon Jade Fragment": tempCollapseFragment,
        "Ancient's Foundation Stone": tempFoundationStone,
        "Dimensional Vestige": tempDimVestige,
        Gold: tempGold,
      },
      statsData: tempStat,
      errorDt: errorMsg.length > 0 ? errorMsg : undefined,
    } as MatsTableRes;
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
    return 320;
  };

  const getEnhanceCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Divider orientation="left">Enhance List</Divider>
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
                          <Radio.Button value={COLLAPSE_JADE_TYPE.ATT}>
                            Attack
                          </Radio.Button>
                          <Radio.Button value={COLLAPSE_JADE_TYPE.DEF}>
                            Defense
                          </Radio.Button>
                        </Radio.Group>
                      </Form.Item>

                      {/* Nest Form.List */}
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
                                      alignItems: "flex-start",
                                      marginBottom: 8,
                                    }}
                                  >
                                    <Form.Item
                                      noStyle
                                      name={[subField.name, "amt"]}
                                      id={`${subField.name}-amt-${idx}`}
                                    >
                                      <InputNumber
                                        placeholder="amount"
                                        max={20}
                                        min={0}
                                      />
                                    </Form.Item>

                                    <CloseOutlined
                                      onClick={() => {
                                        subOpt.remove(subField.name);
                                      }}
                                    />
                                  </Space>

                                  <Form.Item
                                    noStyle
                                    name={[subField.name, "craft"]}
                                    valuePropName="checked"
                                    label={null}
                                  >
                                    <Checkbox>Craft</Checkbox>
                                  </Form.Item>

                                  <Form.Item
                                    noStyle
                                    name={[subField.name, "range"]}
                                  >
                                    <CustomSlider
                                      id={`${subField.name}-range-${idx}`}
                                      min={0}
                                      max={5}
                                    />
                                  </Form.Item>
                                </Card>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => subOpt.add()}
                                block
                                disabled={subFields && subFields.length >= 20}
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

            {/* <Form.Item noStyle shouldUpdate>
              {() => (
                <Typography>
                  <pre>
                    {JSON.stringify(formEnhance.getFieldsValue(), null, 2)}
                  </pre>
                </Typography>
              )}
            </Form.Item> */}
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
          <Divider orientation="left">Material List</Divider>
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
              (enhanceDataSource.matsData
                ? typedEntries(enhanceDataSource.matsData)
                    .filter(([_, value]) => value !== 0)
                    .map(([key, value]) => ({
                      mats: key,
                      amount: value,
                    }))
                : []) as TableResource[]
            }
            columns={columnsResource}
            pagination={false}
            bordered
          />
          <ListingCard
            title="Status Increase"
            data={getStatDif(enhanceDataSource.statsData)}
          />
        </div>
        <TradingHouseCalc
          data={[
            {
              name: "Dim. Vestige",
              amt: enhanceDataSource.matsData?.["Dimensional Vestige"],
            },
          ]}
          additionalTotal={enhanceDataSource.matsData?.Gold}
        />
      </div>
    );
  };

  const craftMat: EnhanceTableMaterialList = {
    "Collapse Dragon Jade Fragment": CollapseJadeCraftMats.collapseFragment,
    "Ancient's Foundation Stone": CollapseJadeCraftMats.foundationStone,
    "Dimensional Vestige": CollapseJadeCraftMats.dimVestige,
    Gold: CollapseJadeCraftMats.gold,
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ marginRight: 30, marginBottom: 10 }}>
            <Title level={5}>{"Enhance Attack Jade Stats"}</Title>
            <Table
              size={"small"}
              dataSource={CollapseJadeAttackStatsTable}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
              })}
              pagination={false}
              bordered
            />
          </div>
          <div style={{}}>
            <Title level={5}>{"Enhance Defense Jade Stats"}</Title>
            <Table
              size={"small"}
              dataSource={CollapseJadeDefendStatsTable}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                defFlag: true,
                magdefFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Mats",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ marginRight: 30, marginBottom: 10 }}>
            <Title level={5}>{"Craft Mats"}</Title>
            <Table
              size={"small"}
              dataSource={
                typedEntries(craftMat)
                  .filter(([key]) => key !== "encLevel")
                  .map(([key, value]) => ({
                    mats: key,
                    amount: value,
                  })) as TableResource[]
              }
              columns={columnsResource}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ marginRight: 30, marginBottom: 10 }}>
            <Title level={5}>{"Enhance Mats"}</Title>
            <Table
              size={"small"}
              dataSource={CollapseJadeEnhanceMatsTable}
              columns={getMatsCol()}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Enhance",
      children: getEnhanceCalculator(),
    },
  ];

  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default CollapseJadeContent;
