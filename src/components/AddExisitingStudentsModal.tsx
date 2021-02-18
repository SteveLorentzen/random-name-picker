import * as React from 'react'
import {
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { IStudent, IStudentInStudentGroup, IStudentGroup } from 'interfacesAndTypes/interfacesAndTypes'
import StudentPreview from 'components/StudentPreview'
import firebase from 'firebase'
import { useFirestore } from 'reactfire'

interface IStudentToAdd {
  studentId: string
  studentName: string
}

type AddExistingStudentsModalProps = {
  onClose: () => void
  isOpen: boolean
  studentDocuments: IStudent[]
  studentsInThisStudentGroupDocuments: IStudentInStudentGroup[]
  studentsInStudentGroupsRef: firebase.firestore.CollectionReference
  studentGroupDocument: IStudentGroup
}

const AddExistingStudentsModal: React.FC<AddExistingStudentsModalProps> = ({
  onClose,
  isOpen,
  studentDocuments,
  studentsInThisStudentGroupDocuments,
  studentsInStudentGroupsRef,
  studentGroupDocument,
}) => {
  const [selectedStudentsToAdd, setSelectedStudentsToAdd] = React.useState<IStudentToAdd[]>([])

  const addBatch = useFirestore().batch()

  const addExistingHandler = () => {
    console.log(selectedStudentsToAdd)
    selectedStudentsToAdd.forEach(student => {
      const newStudentInStudentGroupRef = studentsInStudentGroupsRef.doc()
      addBatch.set(newStudentInStudentGroupRef, {
        studentName: student.studentName,
        studentId: student.studentId,
        studentGroupId: studentGroupDocument.docId,
        studentGroupName: studentGroupDocument.studentGroupName,
        selected: false,
      })
    })
    return addBatch
      .commit()
      .then(() => {
        onClose()
        setSelectedStudentsToAdd([])
      })
      .catch(err => console.log(err))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Existing Students</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box border="1px solid black" maxHeight="500px" minHeight="100px" padding="10px" overflowY="auto">
            {studentDocuments
              ?.filter(student => {
                let studentIsInClass = false
                studentsInThisStudentGroupDocuments?.forEach(studentInGroup => {
                  if (studentInGroup.studentId === student.docId) {
                    studentIsInClass = true
                  }
                })
                return !studentIsInClass
              })
              .map(doc => {
                return (
                  <StudentPreview
                    key={doc.docId}
                    studentName={doc.studentName}
                    studentId={doc.docId}
                    selectedStudentsToAdd={selectedStudentsToAdd}
                    setSelectedStudentsToAdd={setSelectedStudentsToAdd}
                  />
                )
              })}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" mr={3} onClick={addExistingHandler}>
            Add To Group
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AddExistingStudentsModal