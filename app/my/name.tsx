import { useState } from 'react'
import { Pressable } from 'react-native'
import { useRouter } from 'expo-router'

import { Button, TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { CloseCircleIcon } from '@/components/icons'
import { fieldError, rules } from '@/features/auth/validation'
import { myActions, useMyProfile } from '@/features/my/store'
import { colors } from '@/theme'

/** Figma: 이름 설정 */
export default function NameSettingScreen() {
  const router = useRouter()
  const { name } = useMyProfile()
  const [value, setValue] = useState(name)

  const valid = rules.nickname.test(value)
  const canSave = valid && value !== name

  return (
    <FormScreen
      title="이름 설정"
      footer={
        <Button
          disabled={!canSave}
          onPress={() => {
            myActions.setName(value)
            router.back()
          }}
        >
          저장하기
        </Button>
      }
    >
      <TextField
        label="이름"
        placeholder={name}
        helperText={rules.nickname.placeholder}
        errorMessage={fieldError(value, valid, rules.nickname.error)}
        maxLength={10}
        value={value}
        onChangeText={setValue}
        trailing={
          value.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이름 지우기"
              hitSlop={8}
              onPress={() => setValue('')}
            >
              <CloseCircleIcon width={20} height={20} color={colors.ink.faint} />
            </Pressable>
          ) : null
        }
      />
    </FormScreen>
  )
}
