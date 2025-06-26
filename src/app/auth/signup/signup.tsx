// src/pages/signup.tsx
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useColorModeValue,
  Text,
  Link,
} from "@chakra-ui/react"
import { useState } from "react"
// import { ThemeSwitcher } from "@/components/ThemeSwitcher"

const SignupPage = () => {
  const bg = useColorModeValue("brand.50", "gray.800")
  const boxBg = useColorModeValue("white", "gray.700")
  const brandColor = useColorModeValue("brand.900", "brand.500")

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form Submitted:", form)
    // You can now POST to your NestJS backend
  }

  return (
    <Box minH="100vh" bg={bg} py={10} px={4}>
      <ThemeSwitcher />
      <VStack spacing={6} maxW="md" mx="auto" bg={boxBg} p={8} rounded="xl" shadow="lg">
        <Heading color={brandColor}>Create an Account</Heading>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                placeholder="Enter username"
                value={form.username}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
              />
            </FormControl>

            <Button colorScheme="yellow" w="full" type="submit">
              Sign Up
            </Button>
          </VStack>
        </form>
        <Text fontSize="sm">
          Already have an account?{" "}
          <Link color={brandColor} href="/login">
            Log in
          </Link>
        </Text>
      </VStack>
    </Box>
  )
}

export default SignupPage
