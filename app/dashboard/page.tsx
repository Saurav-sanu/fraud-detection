"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Copy, CheckCircle, AlertCircle, BarChart3, Activity, Clock } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardPage() {
  const [copied, setCopied] = useState(false)
  const apiKey = "fd_test_01HPQW3JVNZ5T6G7H8J9K0L1M2"

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Mock data for dashboard
  const stats = [
    { title: "Total Transactions", value: "12,543", icon: Activity },
    { title: "Fraud Detected", value: "231", icon: AlertCircle },
    { title: "Detection Rate", value: "1.84%", icon: BarChart3 },
    { title: "API Calls", value: "15,872", icon: Clock },
  ]

  const recentTransactions = [
    {
      id: "TRX-7829",
      amount: "$1,249.99",
      timestamp: "2025-03-21 14:32:15",
      status: "legitimate",
      confidence: "98%",
    },
    {
      id: "TRX-7828",
      amount: "$5,000.00",
      timestamp: "2025-03-21 14:28:03",
      status: "suspicious",
      confidence: "87%",
    },
    {
      id: "TRX-7827",
      amount: "$129.99",
      timestamp: "2025-03-21 14:15:47",
      status: "legitimate",
      confidence: "99%",
    },
    {
      id: "TRX-7826",
      amount: "$2,500.00",
      timestamp: "2025-03-21 13:58:22",
      status: "suspicious",
      confidence: "76%",
    },
    {
      id: "TRX-7825",
      amount: "$349.50",
      timestamp: "2025-03-21 13:45:11",
      status: "legitimate",
      confidence: "95%",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your fraud detection dashboard</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/">Go to Detection Tool</Link>
            </Button>
            <Button>View Documentation</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest fraud detection results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.id}</TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell>{tx.timestamp}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.status === "suspicious" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {tx.status === "suspicious" ? "Suspicious" : "Legitimate"}
                        </span>
                      </TableCell>
                      <TableCell>{tx.confidence}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm">
                  View All Transactions
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Your API key for integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-sm font-medium">Your API Key</div>
                <div className="flex">
                  <Input value={apiKey} readOnly type="password" className="font-mono" />
                  <Button variant="outline" size="icon" className="ml-2" onClick={copyApiKey}>
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Keep this key secure. Don't share it publicly.</p>
              </div>

              <Tabs defaultValue="curl">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-2">
                  <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                    curl -X POST https://api.frauddetect.com/v1/check \<br />
                    &nbsp;&nbsp;-H "Authorization: Bearer {apiKey}" \<br />
                    &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                    &nbsp;&nbsp;-d '&#123;"transaction_id":"TRX123",...&#125;'
                  </div>
                </TabsContent>
                <TabsContent value="node" className="mt-2">
                  <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                    const response = await fetch('https://api.frauddetect.com/v1/check', &#123;
                    <br />
                    &nbsp;&nbsp;method: 'POST',
                    <br />
                    &nbsp;&nbsp;headers: &#123;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;'Authorization': 'Bearer {apiKey}',
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;'Content-Type': 'application/json'
                    <br />
                    &nbsp;&nbsp;&#125;,
                    <br />
                    &nbsp;&nbsp;body: JSON.stringify(&#123; transaction_id: 'TRX123', ... &#125;)
                    <br />
                    &#125;);
                  </div>
                </TabsContent>
                <TabsContent value="python" className="mt-2">
                  <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                    import requests
                    <br />
                    <br />
                    response = requests.post(
                    <br />
                    &nbsp;&nbsp;'https://api.frauddetect.com/v1/check',
                    <br />
                    &nbsp;&nbsp;headers=&#123;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;'Authorization': 'Bearer {apiKey}',
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;'Content-Type': 'application/json'
                    <br />
                    &nbsp;&nbsp;&#125;,
                    <br />
                    &nbsp;&nbsp;json=&#123;'transaction_id': 'TRX123', ...&#125;
                    <br />)
                  </div>
                </TabsContent>
              </Tabs>

              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  Regenerate API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

