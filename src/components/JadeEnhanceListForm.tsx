import { CloseOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  InputNumber,
  Radio,
  Space,
  Tooltip,
  Typography,
} from "antd";
import type { FormInstance } from "antd/es/form";
import { SliderMarks } from "antd/es/slider";
import CustomSlider from "./CustomSlider";
import {
  JadeEnhanceGroup,
  JadeEnhanceListItem,
} from "../hooks/useJadeCalculator";

const { Text } = Typography;

export interface JadeEnhanceToggle {
  name: string;
  label: React.ReactNode;
  tooltip?: string;
  // Collapse Jade shows its toggle above the range slider, Lunar below it.
  placement?: "beforeRange" | "afterRange";
}

interface JadeEnhanceListFormProps<TItem extends JadeEnhanceListItem> {
  form: FormInstance<{ items: Array<JadeEnhanceGroup<TItem>> }>;
  types: Array<{ label: string; value: string }>;
  onValuesChange: (values: { items: Array<JadeEnhanceGroup<TItem>> }) => void;
  // Warning messages from reduceJadeEnhanceList, listed under the form.
  errors?: string[];
  width: number;
  range?: { min?: number; max?: number; marks?: SliderMarks };
  amountMax?: number;
  maxTypes?: number;
  maxItems?: number;
  itemToggle?: JadeEnhanceToggle;
}

// The "Enhance List" form shared by the jade calculators: one card per jade
// type (Attack/Defense), each holding a list of "how many jades, over which
// enhancement range" rows, plus an optional per-row checkbox (e.g. Collapse's
// Craft, Lunar's Evolve). The calculation itself stays in the screen.
const JadeEnhanceListForm = <TItem extends JadeEnhanceListItem>({
  form,
  types,
  onValuesChange,
  errors,
  width,
  range,
  amountMax = 20,
  maxTypes = 2,
  maxItems = 20,
  itemToggle,
}: JadeEnhanceListFormProps<TItem>) => {
  const renderToggle = (name: number, idx: number) =>
    itemToggle ? (
      <Form.Item
        noStyle
        name={[name, itemToggle.name]}
        valuePropName="checked"
        label={null}
      >
        <Checkbox id={`${name}-${itemToggle.name}-${idx}`}>
          {itemToggle.tooltip ? (
            <Tooltip
              title={itemToggle.tooltip}
              trigger="hover"
              color="blue"
              placement="right"
            >
              {itemToggle.label}
            </Tooltip>
          ) : (
            itemToggle.label
          )}
        </Checkbox>
      </Form.Item>
    ) : null;

  const placement = itemToggle?.placement ?? "afterRange";

  return (
    <>
      <Divider orientation="left">Enhance List</Divider>
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        form={form}
        name="dynamic_form_complex"
        style={{ maxWidth: 600 }}
        autoComplete="off"
        initialValues={{ items: [{}] }}
        onValuesChange={(_, allValues) => onValuesChange(allValues)}
      >
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <div
              style={{ display: "flex", rowGap: 16, flexDirection: "column" }}
            >
              {fields.map((field, index) => (
                <Card
                  size="small"
                  title={`Enhance ${field.name + 1}`}
                  style={{ minWidth: width }}
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
                      {types.map((type) => (
                        <Radio.Button key={type.value} value={type.value}>
                          {type.label}
                        </Radio.Button>
                      ))}
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
                                    max={amountMax}
                                    min={0}
                                  />
                                </Form.Item>

                                <CloseOutlined
                                  onClick={() => {
                                    subOpt.remove(subField.name);
                                  }}
                                />
                              </Space>

                              {placement === "beforeRange" &&
                                renderToggle(subField.name, idx)}

                              <Form.Item
                                noStyle
                                name={[subField.name, "range"]}
                              >
                                <CustomSlider
                                  id={`${subField.name}-range-${idx}`}
                                  min={range?.min}
                                  max={range?.max}
                                  mark={range?.marks}
                                />
                              </Form.Item>

                              {placement === "afterRange" &&
                                renderToggle(subField.name, idx)}
                            </Card>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() => subOpt.add()}
                            block
                            disabled={subFields && subFields.length >= maxItems}
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
                disabled={fields && fields.length >= maxTypes}
              >
                + Add Type
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
      {errors && errors.length > 0 && (
        <div style={{ marginTop: 4, maxWidth: width }}>
          <Space direction="vertical" size={"small"}>
            {errors.map((it, x) => (
              <Text type="warning" key={`error-label-${x}`}>
                {it}
              </Text>
            ))}
          </Space>
        </div>
      )}
    </>
  );
};

export default JadeEnhanceListForm;
