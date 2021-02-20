import * as React from 'react'
import { Heading, IconButton, useDisclosure } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { useFirestore, useUser } from 'reactfire'
import ConfirmationModal from 'components/ConfirmationModal'
import { StudentContainer } from 'styles'

type StudentProps = {
  studentName: string
  docId: string
}

const Student: React.FC<StudentProps> = ({ studentName, docId }) => {
  const { onClose, onOpen, isOpen } = useDisclosure()

  const { data: user } = useUser()

  const teacherRef = useFirestore().collection('teachers').doc(user.uid)
  const studentRef = teacherRef.collection('students').doc(docId)
  const studentsInStudentGroupsRef = teacherRef.collection('studentsInStudentGroups').where('studentId', '==', docId)

  const deleteBatch = useFirestore().batch()

  const deleteHandler = async () => {
    console.log('delete student from students collection and all instances from studentsInStudentGroups collection')
    deleteBatch.delete(studentRef)
    const snapshot = await studentsInStudentGroupsRef.get()
    if (snapshot.docs.length > 0) {
      snapshot.docs.forEach(doc => {
        deleteBatch.delete(doc.ref)
      })
    }
    deleteBatch.commit()
  }

  return (
    <>
      <StudentContainer>
        <Heading as="h3" size="md">
          {studentName}
        </Heading>
        <IconButton icon={<DeleteIcon />} aria-label="delete" onClick={onOpen} />
      </StudentContainer>
      <ConfirmationModal
        buttonText="Confirm"
        modalHeadingText="Confirm Delete"
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={deleteHandler}
      >
        Are you sure you want to delete this student? They will be removed from all groups.
      </ConfirmationModal>
    </>
  )
}

export default Student
