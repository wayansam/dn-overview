import {
  Button,
  Checkbox,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  CHARACTER_LEVEL_MAX,
  CHARACTER_LEVEL_MIN,
  CHARACTER_LIMIT,
  CHARACTER_NAME_MAX_LENGTH,
  CHARACTER_NAME_PATTERN,
} from "../constants/Character.constants";
import { CHARACTER_CLASS } from "../constants/InGame.constants";
import {
  ClassData,
  getClassById,
  getSkillsByClassId,
} from "../data/character/ClassData";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Character } from "../interface/Account.interface";
import {
  addCharacter,
  deleteCharacter,
  updateCharacter,
} from "../slice/Character.reducer";
import { setHasUnsavedChanges } from "../slice/UIState.reducer";
import { isNameTaken } from "../utils/characterStorage.util";
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

interface CharacterDetailModalProps {
  // Leave out to open a blank form for a new character.
  characterId?: string;
  onClose: () => void;
}

// Mounted only while open, so every open starts from fresh state.
const CharacterDetailModal = ({
  characterId,
  onClose,
}: CharacterDetailModalProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<CharacterFormValues>();
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();

  const { characters, groups, mainCharacterId } = useAppSelector(
    (state) => state.Character,
  );
  const isFull = characters.length >= CHARACTER_LIMIT;

  const [selectedId, setSelectedId] = useState(characterId);
  const [mode, setMode] = useState<Mode>(() =>
    characterId ? "view" : "new",
  );
  const [isDirty, setIsDirty] = useState(false);

  const selectedCharacter = characters.find((item) => item.id === selectedId);
  const mainCharacter = characters.find((item) => item.id === mainCharacterId);
  const watchedClassId = Form.useWatch("classId", form);
  const watchedClass = getClassById(watchedClassId);
  const watchedSkills = getSkillsByClassId(watchedClassId);
  const isEditing = mode !== "view";

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
  }, [form, mode, selectedCharacter, mainCharacterId]);

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

  const goToView = (id: string | undefined) => {
    setSelectedId(id);
    setMode("view");
    setIsDirty(false);
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

  // Closes right away, or after the user chooses Save / Discard.
  const requestClose = () => {
    if (!isDirty) {
      onClose();
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
              onClose();
            }}
          >
            Discard
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              instance.destroy();
              if (await save()) onClose();
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
    messageApi.success(`${selectedCharacter.name} deleted`);
    onClose();
  };

  const footer = isEditing ? (
    <Space wrap>
      <Button
        onClick={() => (mode === "new" ? requestClose() : goToView(selectedId))}
      >
        Cancel
      </Button>
      <Button type="primary" onClick={save} disabled={mode === "new" && isFull}>
        Save
      </Button>
    </Space>
  ) : (
    <Space wrap>
      <Popconfirm
        title={`Delete ${selectedCharacter?.name}?`}
        description="This cannot be undone."
        okText="Delete"
        okButtonProps={{ danger: true }}
        onConfirm={onDelete}
      >
        <Button danger>Delete</Button>
      </Popconfirm>
      <Button type="primary" onClick={() => setMode("edit")}>
        Edit
      </Button>
    </Space>
  );

  return (
    <>
      {modalContextHolder}
      {messageContextHolder}
      <Modal
        open
        title={mode === "new" ? "New character" : selectedCharacter?.name}
        onCancel={requestClose}
        footer={footer}
        width={560}
      >
        <Form<CharacterFormValues>
          form={form}
          layout="vertical"
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
              isEditing && mainCharacter && mainCharacter.id !== selectedId
                ? `Current main: ${mainCharacter.name}. Checking this replaces it.`
                : undefined
            }
          >
            <Checkbox>Main character</Checkbox>
          </Form.Item>
        </Form>

        {watchedClass && (
          <>
            <Divider orientation="left">{watchedClass.name}</Divider>
            <Descriptions size="small" column={1} bordered>
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
      </Modal>
    </>
  );
};

export default CharacterDetailModal;
