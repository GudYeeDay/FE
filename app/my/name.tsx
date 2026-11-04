import { useState } from 'react'
import { Alert, Pressable } from 'react-native'
import { useRouter } from 'expo-router'

import { Button, TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { CloseCircleIcon } from '@/components/icons'
import { fieldError, rules } from '@/features/auth/validation'
import { errorText } from '@/api/http'
import { useChangeName, useMyProfile } from '@/features/my/api'
import { colors } from '@/theme'

/** Figma: 이름 설정 */
export default function NameSettingScreen() {
  const router = useRouter()
  const name = useMyProfile().data?.name ?? ''
  const changeName = useChangeName()
  const [value, setValue] = useState(name)

  const valid = rules.nickname.test(value)
  const canSave = valid && value !== name && !changeName.isPending

  return (
    <FormScreen
      title="이름 설정"
      footer={
        <Button
          disabled={!canSave}
          onPress={() =>
            changeName.mutate(value, {
              onSuccess: () => router.back(),
              onError: (error) => Alert.alert('이름을 바꾸지 못했어요', errorText(error)),
            })
          }
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
