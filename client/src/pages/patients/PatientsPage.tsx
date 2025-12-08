import { useQuery } from '@tanstack/react-query'
import { patientsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function PatientsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['patients'],
        queryFn: () => patientsAPI.getAll(),
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Patients</h1>
                    <p className="text-muted-foreground">
                        Manage patient records and medical history
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Patient List</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p>Loading patients...</p>
                    ) : data?.data?.data?.length > 0 ? (
                        <div className="space-y-2">
                            {data.data.data.map((patient: any) => (
                                <div
                                    key={patient.id}
                                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                                >
                                    <p className="font-medium">
                                        {patient.firstName} {patient.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {patient.email || patient.phone}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No patients found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
