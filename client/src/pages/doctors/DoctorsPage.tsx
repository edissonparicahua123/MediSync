import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stethoscope, Plus, Search, Loader2, Edit, Trash2 } from 'lucide-react'
import { doctorsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import DoctorModal from '@/components/modals/DoctorModal'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DoctorsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [doctors, setDoctors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const response = await doctorsAPI.getAll()
            setDoctors(response.data.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load doctors',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await doctorsAPI.delete(deleteId)
            toast({
                title: 'Success',
                description: 'Doctor deleted successfully',
            })
            loadData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete doctor',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const filteredDoctors = doctors.filter(doc =>
        doc.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Stethoscope className="h-8 w-8" />
                        Doctors
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage medical staff and specialists</p>
                </div>
                <Button onClick={() => {
                    setSelectedDoctor(null)
                    setModalOpen(true)
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                </Button>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search doctors by name or specialization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Specialization</th>
                                <th className="text-left p-3">Contact</th>
                                <th className="text-left p-3">License</th>
                                <th className="text-left p-3">Experience</th>
                                <th className="text-left p-3">Fee</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                                        No doctors found
                                    </td>
                                </tr>
                            ) : (
                                filteredDoctors.map((doctor) => (
                                    <tr key={doctor.id} className="border-b hover:bg-accent">
                                        <td className="p-3 font-medium">
                                            Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                                        </td>
                                        <td className="p-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                {doctor.specialization}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm">
                                            <div>{doctor.user?.email}</div>
                                            <div className="text-muted-foreground">{doctor.user?.phone}</div>
                                        </td>
                                        <td className="p-3 text-sm font-mono">{doctor.licenseNumber}</td>
                                        <td className="p-3 text-sm">{doctor.yearsExperience} years</td>
                                        <td className="p-3 text-sm">${Number(doctor.consultationFee).toFixed(2)}</td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedDoctor(doctor)
                                                        setModalOpen(true)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setDeleteId(doctor.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <DoctorModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                doctor={selectedDoctor}
                onSuccess={loadData}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the doctor profile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
