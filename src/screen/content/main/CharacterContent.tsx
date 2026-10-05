import { OrderedListOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import ReorderListModal from "../../../components/ReorderListModal";
import {
  CHARACTER_LEVEL_MAX,
  CHARACTER_LEVEL_MIN,
  CHARACTER_LIMIT,
  CHARACTER_NAME_MAX_LENGTH,
  CHARACTER_NAME_PATTERN,
} from "../../../constants/Character.constants";
import { CHARACTER_CLASS } from "../../../constants/InGame.constants";
import {
  ClassData,
  getClassById,
  getSkillsByClassId,
} from "../../../data/character/ClassData";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { Character } from "../../../interface/Account.interface";
import {
  addCharacter,
  deleteCharacter,
  reorderCharacters,
  updateCharacter,
} from "../../../slice/Character.reducer";
import { setHasUnsavedChanges } from "../../../slice/UIState.reducer";
import { isNameTaken } from "../../../utils/characterStorage.util";
const { Text } = Typography;

type Mode = "view" | "edit" | "new";

interface CharacterFormValues {
  name: string;
  level: number;
  classId: string;
  groupId?: string;
  isMain: boolean;
}

const classOptions = Object.values(CHARACTER_CLASS).map((baseClass) => ({
  label: baseClass,
  options: ClassData.filter((item) => item.baseClass === baseClass).map(
    (item) => ({ label: item.name, value: item.id }),
  ),
}));

const CharacterContent = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<CharacterFormValues>();
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();

  const { characters, groups, mainCharacterId } = useAppSelector(
    (state) => state.Character,
  );
  const payload = useAppSelector(
    (state) => state.UIState.selectedSideBar.payload?.characterScreen,
  );
  const isFull = characters.length >= CHARACTER_LIMIT;

  // Payload is only read on mount: Details / Add from other screens always
  // mount this screen fresh.
  const [selectedId, setSelectedId] = useState<string | undefined>(() =>
    payload?.characterId &&
    characters.some((item) => item.id === payload.characterId)
      ? payload.characterId
      : mainCharacterId,
  );
  const [mode, setMode] = useState<Mode>(() =>
    payload?.isNew && !isFull ? "new" : "view",
  );
  const [isDirty, setIsDirty] = useState(false);
  // Bumped to force a blank form even when already in "new" mode.
  const [resetToken, setResetToken] = useState(0);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  const selectedCharacter = characters.find((item) => item.id === selectedId);
  const mainCharacter = characters.find((item) => item.id === mainCharacterId);
  const watchedClassId = Form.useWatch("classId", form);
  const watchedClass = getClassById(watchedClassId);
  const watchedSkills = getSkillsByClassId(watchedClassId);
  const isEditing = mode !== "view";
  const isFormVisible = mode === "new" || !!selectedCharacter;

  useEffect(() => {
    if (mode === "new") {
      form.resetFields();
    } else if (mode === "view" && selectedCharacter) {
      form.setFieldsValue({
        name: selectedCharacter.name,
        level: selectedCharacter.level,
        classId: selectedCharacter.classId,
        groupId: selectedCharacter.groupId,
        isMain: selectedCharacter.id === mainCharacterId,
      });
    }
  }, [form, mode, selectedCharacter, mainCharacterId, resetToken]);

  // Lets the sidebar warn before leaving with unsaved changes.
  useEffect(() => {
    dispatch(setHasUnsavedChanges(isDirty));
  }, [dispatch, isDirty]);
  useEffect(
    () => () => {
      dispatch(setHasUnsavedChanges(false));
    },
    [dispatch],
  );

  const characterOptions = useMemo(
    () =>
      characters.map((item) => ({
        value: item.id,
        label: `${item.id === mainCharacterId ? "★ " : ""}${item.name} - Lv.${
          item.level
        } ${getClassById(item.classId)?.name ?? ""}`,
      })),
    [characters, mainCharacterId],
  );

  const goToView = (id: string | undefined) => {
    setSelectedId(id);
    setMode("view");
    setIsDirty(false);
  };

  const startNew = () => {
    setMode("new");
    setIsDirty(false);
    setResetToken((prev) => prev + 1);
  };

  const save = async (): Promise<boolean> => {
    let values: CharacterFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return false;
    }
    const data: Omit<Character, "id"> = {
      name: values.name.trim(),
      level: values.level,
      classId: values.classId,
      groupId: values.groupId ?? undefined,
    };
    if (mode === "new") {
      const action = dispatch(addCharacter(data, values.isMain));
      goToView(action.payload.character.id);
    } else if (selectedId) {
      dispatch(
        updateCharacter({
          character: { ...data, id: selectedId },
          isMain: values.isMain,
        }),
      );
      goToView(selectedId);
    }
    messageApi.success(`${data.name} saved`);
    return true;
  };

  // Runs `proceed` right away, or after the user chooses Save / Discard.
  const confirmUnsaved = (proceed: () => void) => {
    if (!isDirty) {
      proceed();
      return;
    }
    const instance = modal.confirm({
      title: "Save current changes?",
      content: "This character has unsaved changes.",
      footer: (
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={() => instance.destroy()}>Cancel</Button>
          <Button
            danger
            onClick={() => {
              instance.destroy();
              proceed();
            }}
          >
            Discard
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              instance.destroy();
              if (await save()) proceed();
            }}
          >
            Save
          </Button>
        </Space>
      ),
    });
  };

  const onDelete = () => {
    if (!selectedCharacter) return;
    dispatch(deleteCharacter(selectedCharacter.id));
    goToView(
      mainCharacterId !== selectedCharacter.id ? mainCharacterId : undefined,
    );
    messageApi.success(`${selectedCharacter.name} deleted`);
  };

  return (
    <div>
      {modalContextHolder}
      {messageContextHolder}
      <ReorderListModal
        title="Arrange Characters"
        open={isReorderOpen}
        items={characters.map((item) => ({
          id: item.id,
          content: (
            <>
              <Text>{item.name}</Text>
              <Text type="secondary">
                Lv.{item.level} {getClassById(item.classId)?.name}
              </Text>
              {item.id === mainCharacterId && <Tag color="gold">Main</Tag>}
            </>
          ),
        }))}
        onSave={(ids) => dispatch(reorderCharacters(ids))}
        onClose={() => setIsReorderOpen(false)}
      />
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          style={{ minWidth: 280 }}
          placeholder={mode === "new" ? "New character" : "Select character"}
          value={mode === "new" ? undefined : selectedCharacter?.id}
          options={characterOptions}
          showSearch
          optionFilterProp="label"
          onChange={(id: string) => confirmUnsaved(() => goToView(id))}
          notFoundContent="No character yet"
        />
        <Tooltip title="Arrange character order">
          <Button
            icon={<OrderedListOutlined />}
            disabled={characters.length < 2}
            onClick={() => setIsReorderOpen(true)}
          />
        </Tooltip>
        <Tooltip
          title={isFull ? `Limited to ${CHARACTER_LIMIT} characters` : ""}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isFull}
            onClick={() => confirmUnsaved(startNew)}
          >
            Add
          </Button>
        </Tooltip>
      </Space>

      {!isFormVisible ? (
        <Empty
          description={
            characters.length
              ? "Select a character, or set one as main to open it by default"
              : "No character yet, use Add to create one"
          }
        />
      ) : (
        <>
          <Form<CharacterFormValues>
            form={form}
            layout="vertical"
            style={{ maxWidth: 480 }}
            disabled={!isEditing}
            initialValues={{ level: CHARACTER_LEVEL_MAX, isMain: false }}
            onValuesChange={() => {
              if (isEditing) setIsDirty(true);
            }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Name is required" },
                {
                  pattern: CHARACTER_NAME_PATTERN,
                  message: "Only letters and numbers",
                },
                {
                  validator: (_, value?: string) =>
                    value &&
                    isNameTaken(
                      characters,
                      value,
                      mode === "edit" ? selectedId : undefined,
                    )
                      ? Promise.reject(new Error("Name is already used"))
                      : Promise.resolve(),
                },
              ]}
            >
              <Input maxLength={CHARACTER_NAME_MAX_LENGTH} showCount />
            </Form.Item>
            <Form.Item
              label="Level"
              name="level"
              rules={[{ required: true, message: "Level is required" }]}
            >
              <InputNumber
                min={CHARACTER_LEVEL_MIN}
                max={CHARACTER_LEVEL_MAX}
                precision={0}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              label="Class"
              name="classId"
              rules={[{ required: true, message: "Class is required" }]}
            >
              <Select
                options={classOptions}
                showSearch
                optionFilterProp="label"
                placeholder="Select class"
              />
            </Form.Item>
            <Form.Item label="ID" name="groupId">
              <Select
                allowClear
                placeholder="No ID"
                options={groups.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                notFoundContent="No ID yet, add one in the ID screen"
              />
            </Form.Item>
            <Form.Item
              name="isMain"
              valuePropName="checked"
              extra={
                isEditing &&
                mainCharacter &&
                mainCharacter.id !== selectedId
                  ? `Current main: ${mainCharacter.name}. Checking this replaces it.`
                  : undefined
              }
            >
              <Checkbox>Main character</Checkbox>
            </Form.Item>
          </Form>

          <Space wrap>
            {isEditing ? (
              <>
                <Button type="primary" onClick={save}>
                  Save
                </Button>
                <Button onClick={() => goToView(selectedId)}>Cancel</Button>
              </>
            ) : (
              <>
                <Button type="primary" onClick={() => setMode("edit")}>
                  Edit
                </Button>
                <Popconfirm
                  title={`Delete ${selectedCharacter?.name}?`}
                  description="This cannot be undone."
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={onDelete}
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              </>
            )}
          </Space>

          {watchedClass && (
            <>
              <Divider orientation="left">{watchedClass.name}</Divider>
              <Descriptions
                size="small"
                column={1}
                bordered
                style={{ maxWidth: 640 }}
              >
                <Descriptions.Item label="Base Class">
                  {watchedClass.baseClass}
                </Descriptions.Item>
                <Descriptions.Item label="2nd Job">
                  {watchedClass.secondJob}
                </Descriptions.Item>
                {watchedSkills.length ? (
                  watchedSkills.map((skill) => (
                    <Descriptions.Item key={skill.id} label={skill.slot}>
                      {skill.name}
                    </Descriptions.Item>
                  ))
                ) : (
                  <Descriptions.Item label="Skills">
                    <Text type="secondary">Not added yet</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CharacterContent;
