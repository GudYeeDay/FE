import { useEffect, useState } from 'react'
import { Pressable, Text } from 'react-native'
import { useRouter } from 'expo-router'

import { remoteErrorText } from '@/api/http'
import { Button, TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { fieldError, rules } from '@/features/auth/validation'
import { useChangeName, useMyProfile } from '@/features/my/api'

export function NameScreen() {
  const router = useRouter()
  const profile = useMyProfile()
  const changeName = useChangeName()
  const nickname = profile.data?.name ?? ''
  const [value, setValue] = useState(nickname)

  useEffect(() => {
    if (profile.data?.name) setValue(profile.data.name)
  }, [profile.data?.name])

  const valid = rules.nickname.test(value)
  const changed = value.trim() !== nickname
  const canSave = valid && changed && !changeName.isPending

  return (
    <FormScreen
      title="이름 설정"
      footer={
        <Button
          disabled={!canSave}
          onPress={() => {
            changeName.mutate(value.trim(), { onSuccess: () => router.back() })
          }}
        >
          저장하기
        </Button>
      }
    >
      {changeName.isError ? (
        <Text className="mb-3 font-ko text-ko-12 text-main">{remoteErrorText(changeName.error)}</Text>
      ) : null}
      <TextField
        label="닉네임"
        placeholder={rules.nickname.placeholder}
        helperText={rules.nickname.placeholder}
        maxLength={10}
        value={value}
        onChangeText={setValue}
        errorMessage={fieldError(value, valid, rules.nickname.error)}
        trailing={
          value.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닉네임 지우기"
              hitSlop={8}
              onPress={() => setValue('')}
            >
              <Text className="font-ko text-ko-16 text-ink-faint">×</Text>
            </Pressable>
          ) : null
        }
      />
    </FormScreen>
  )
}
