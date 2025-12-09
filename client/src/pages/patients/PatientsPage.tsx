import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { patientsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Loader2, Edit, Trash2 } from 'lucide-react'
import PatientModal from '@/components/modals/PatientModal'

export default function PatientsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<any>(null)

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['patients'],
        queryFn: () => patientsAPI.getAll(),
    })

    const patients = data?.data?.data || []
    const filteredPatients = patients.filter((patient: any) =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
    )

    const handleEdit = (patient: any) => {
        setSelectedPatient(patient)
        setModalOpen(true)
    }

    const handleAdd = () => {
        setSelectedPatient(null)
        setModalOpen(true)
    }

    const handleSuccess = () => {
        refetch()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Patients</h1>
                    <p className="text-muted-foreground">
                        Manage patient records and medical history
                    </p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search patients by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : filteredPatients.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3">Name</th>
                                        <th className="text-left p-3">Date of Birth</th>
                                        <th className="text-left p-3">Gender</th>
                                        <th className="text-left p-3">Contact</th>
                                        <th className="text-left p-3">Blood Type</th>
                                        <th className="text-left p-3">Status</th>
                                        <th className="text-left p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient: any) => (
                                        <tr key={patient.id} className="border-b hover:bg-accent">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium">
                                                        {patient.firstName} {patient.lastName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ID: {patient.id.slice(0, 8)}...
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {new Date(patient.dateOfBirth).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">{patient.gender}</td>
                                            <td className="p-3">
                                                <div>
                                                    <p className="text-sm">{patient.phone}</p>
                                                    {patient.email && (
                                                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">{patient.bloodType || 'N/A'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${patient.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {patient.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(patient)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                {searchTerm ? 'No patients found matching your search' : 'No patients yet. Add your first patient!'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <PatientModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                patient={selectedPatient}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
