"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, FileText, Upload, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as XLSX from "xlsx"
import Papa from "papaparse"

type Transaction = {
  transactionId: string
  payerId: string
  payeeId: string
  amount: string | number
  location: string
  timestamp: string
}

type FraudResult = Transaction & {
  isFraudulent: boolean
  confidenceScore: number
  riskFactors?: string[]
}

export default function BulkUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<Transaction[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<FraudResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    setResults(null)

    if (acceptedFiles.length === 0) {
      return
    }

    const file = acceptedFiles[0]
    setFile(file)

    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const transactions = results.data as Transaction[]
          setParsedData(transactions)
        },
        error: (error) => {
          setError(`Failed to parse CSV file: ${error.message}`)
          setFile(null)
        },
      })
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const transactions = XLSX.utils.sheet_to_json(worksheet) as Transaction[]
          setParsedData(transactions)
        } catch (err) {
          setError("Failed to parse Excel file")
          setFile(null)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      setError("Unsupported file format. Please upload a CSV or Excel file.")
      setFile(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  })

  const processTransactions = async () => {
    if (!parsedData || parsedData.length === 0) {
      setError("No data to process")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // In a real application, this would be an actual API call
      // For demo purposes, we're simulating an API response
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate fraud detection results
      const results: FraudResult[] = parsedData.map((transaction) => {
        const isFraudulent = Math.random() > 0.7
        return {
          ...transaction,
          isFraudulent,
          confidenceScore: Math.round(Math.random() * 100) / 100,
          riskFactors: isFraudulent
            ? ["Unusual transaction amount", "Suspicious location", "Transaction pattern anomaly"].slice(
                0,
                Math.floor(Math.random() * 3) + 1,
              )
            : undefined,
        }
      })

      setResults(results)
    } catch (err) {
      setError("Failed to process transactions. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setParsedData(null)
    setResults(null)
    setError(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Transaction Upload</CardTitle>
        <CardDescription>Upload a CSV or Excel file containing multiple transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {!file && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto mb-4 text-gray-500" />
            <p className="text-lg font-medium">
              {isDragActive ? "Drop the file here" : "Drag & drop a file here, or click to select"}
            </p>
            <p className="text-sm text-gray-500 mt-2">Supported formats: CSV, Excel (.xlsx, .xls)</p>
          </div>
        )}

        {file && parsedData && !results && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">{file.name}</span>
              <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(parsedData[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {parsedData.length > 5 && (
              <p className="text-sm text-gray-500 text-center">Showing 5 of {parsedData.length} transactions</p>
            )}

            <div className="flex gap-4">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={processTransactions} className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Transactions"
                )}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-500">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle>Processing Complete</AlertTitle>
              <AlertDescription>{results.length} transactions processed</AlertDescription>
            </Alert>

            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Risk Factors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.transactionId}</TableCell>
                      <TableCell>{result.amount}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.isFraudulent ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {result.isFraudulent ? "Suspicious" : "Legitimate"}
                        </span>
                      </TableCell>
                      <TableCell>{(result.confidenceScore * 100).toFixed(0)}%</TableCell>
                      <TableCell>
                        {result.riskFactors ? (
                          <ul className="list-disc pl-5">
                            {result.riskFactors.map((factor, i) => (
                              <li key={i} className="text-sm">
                                {factor}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button onClick={resetForm} variant="outline">
              Upload Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

