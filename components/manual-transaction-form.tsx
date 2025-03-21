"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  payerId: z.string().min(1, "Payer ID is required"),
  payeeId: z.string().min(1, "Payee ID is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  location: z.string().min(1, "Location is required"),
  timestamp: z.string().min(1, "Timestamp is required"),
})

type FormValues = z.infer<typeof formSchema>

export default function ManualTransactionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<null | {
    isFraudulent: boolean
    confidenceScore: number
    riskFactors?: string[]
  }>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionId: "",
      payerId: "",
      payeeId: "",
      amount: "",
      location: "",
      timestamp: new Date().toISOString().slice(0, 16),
    },
  })

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    setError(null)
    setApiResponse(null)

    try {
      // In a real application, this would be an actual API call
      // For demo purposes, we're simulating an API response
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate random fraud detection result
      const isFraudulent = Math.random() > 0.7
      const confidenceScore = Math.round(Math.random() * 100) / 100

      const response = {
        isFraudulent,
        confidenceScore,
        riskFactors: isFraudulent
          ? ["Unusual transaction amount", "Suspicious location", "Transaction pattern anomaly"]
          : undefined,
      }

      setApiResponse(response)
    } catch (err) {
      setError("Failed to process transaction. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manual Transaction Entry</CardTitle>
        <CardDescription>Enter transaction details to check for potential fraud</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID</FormLabel>
                    <FormControl>
                      <Input placeholder="TRX123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timestamp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timestamp</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payer ID</FormLabel>
                    <FormControl>
                      <Input placeholder="PAYER001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="PAYEE001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="100.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Transaction"
              )}
            </Button>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {apiResponse && (
          <Alert
            className={`mt-6 ${apiResponse.isFraudulent ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}`}
          >
            <div className="flex items-start">
              {apiResponse.isFraudulent ? (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              )}
              <div>
                <AlertTitle className={apiResponse.isFraudulent ? "text-red-700" : "text-green-700"}>
                  {apiResponse.isFraudulent ? "Potential Fraud Detected" : "Transaction Appears Legitimate"}
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    <p className="font-medium">Confidence Score: {apiResponse.confidenceScore * 100}%</p>

                    {apiResponse.riskFactors && (
                      <div className="mt-2">
                        <p className="font-medium">Risk Factors:</p>
                        <ul className="list-disc pl-5 mt-1">
                          {apiResponse.riskFactors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

