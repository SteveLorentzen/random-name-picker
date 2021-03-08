import * as React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import 'firebase/firestore'
import { useFirestore, useUser, useFirestoreDocData, useFirestoreCollectionData } from 'reactfire'
import { Flex, useDisclosure } from '@chakra-ui/react'
import { IStudentGroup, IStudent, IStudentInStudentGroup, Params } from 'interfacesAndTypes'
import FullScreenDisplay from 'components/FullScreenDisplay'
import AddExistingStudentsModal from 'components/AddExisitingStudentsModal'
import NewStudent from 'components/NewStudent'
import { PageContentsBox } from 'styles'
import HeadingBoxWithBackButton from 'components/HeadingBoxWithBackButton'
import EditableStudentGroupName from 'components/EditableStudentGroupName'
import NameDisplay from 'components/NameDisplay'
import UnselectedStudents from 'components/UnselectedStudents'

const StudentGroup: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [unselected, setUnselected] = React.useState<IStudentInStudentGroup[]>([])
  const [selected, setSelected] = React.useState<IStudentInStudentGroup[]>([])
  const [selectedStudent, setSelectedStudent] = React.useState<IStudentInStudentGroup | null>(null)
  const [fullScreenDisplayIsOpen, setFullScreenDisplayIsOpen] = React.useState(false)

  const history = useHistory()
  const params: Params = useParams()
  const studentGroupId = params.groupId

  const { data: user } = useUser()

  const teacherRef = useFirestore().collection('teachers').doc(user.uid)

  const studentGroupRef = teacherRef.collection('studentGroups').doc(studentGroupId)
  const studentGroupDocument = useFirestoreDocData<IStudentGroup & { docId: string }>(studentGroupRef, {
    idField: 'docId',
  }).data

  const studentsInStudentGroupsRef = teacherRef.collection('studentsInStudentGroups')

  const studentsInThisStudentGroupRef = studentsInStudentGroupsRef.where('studentGroupId', '==', studentGroupId)
  const studentsInThisStudentGroupDocuments = useFirestoreCollectionData<IStudentInStudentGroup & { docId: string }>(
    studentsInThisStudentGroupRef,
    { idField: 'docId' },
  ).data

  const unselectedStudentsRef = studentsInStudentGroupsRef
    .where('studentGroupId', '==', studentGroupId)
    .where('selected', '==', false)

  const unselectedStudentsDocuments = useFirestoreCollectionData<IStudentInStudentGroup & { docId: string }>(
    unselectedStudentsRef,
    { idField: 'docId' },
  ).data

  const selectedStudentsRef = studentsInStudentGroupsRef
    .where('studentGroupId', '==', studentGroupId)
    .where('selected', '==', true)

  const selectedStudentsDocuments = useFirestoreCollectionData<IStudentInStudentGroup & { docId: string }>(
    selectedStudentsRef,
    { idField: 'docId' },
  ).data

  const studentsRef = teacherRef.collection('students')
  const studentDocuments = useFirestoreCollectionData<IStudent & { docId: string }>(studentsRef, { idField: 'docId' })
    .data

  React.useEffect(() => {
    console.log(unselectedStudentsDocuments)
    unselectedStudentsDocuments && setUnselected(unselectedStudentsDocuments.sort((a, b) => a.order - b.order))
  }, [unselectedStudentsDocuments])

  React.useEffect(() => {
    console.log(selectedStudentsDocuments)
    selectedStudentsDocuments && setSelected(selectedStudentsDocuments.sort((a, b) => a.order - b.order))
  }, [selectedStudentsDocuments])

  const backHandler = () => {
    history.push('/')
  }

  const selectHandler = () => {
    const selectedStudent = unselected[0]
    setSelectedStudent(selectedStudent)
    if (unselected.length <= 1) {
      resetSelectedStatus()
    } else {
      studentsInStudentGroupsRef
        .doc(selectedStudent.docId)
        .update({ selected: true })
        .catch(err => console.log(err))
    }
  }

  const updateBatch = useFirestore().batch()

  const resetSelectedStatus = () => {
    const orderArray: number[] = []
    for (let i = 1; i <= studentsInThisStudentGroupDocuments.length; i++) {
      orderArray[i - 1] = i
    }
    console.log(orderArray)
    studentsInThisStudentGroupRef
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          console.log(doc, 'made it here')
          const randomOrderValue = orderArray.splice(Math.floor(Math.random() * orderArray.length), 1)
          updateBatch.update(doc.ref, { selected: false, order: randomOrderValue[0] })
        })
        return updateBatch.commit().catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  }

  return (
    <PageContentsBox>
      <HeadingBoxWithBackButton backHandler={backHandler}>
        <Flex justify="flex-end">
          <EditableStudentGroupName studentGroupDocument={studentGroupDocument} studentGroupRef={studentGroupRef} />
        </Flex>
      </HeadingBoxWithBackButton>

      <NameDisplay
        selectedStudent={selectedStudent}
        setFullScreenDisplayIsOpen={setFullScreenDisplayIsOpen}
        selectHandler={selectHandler}
      />

      <UnselectedStudents
        studentsInThisStudentGroup={studentsInThisStudentGroupDocuments?.sort((a, b) => {
          let val1 = a.order
          let val2 = b.order
          if (a.selected) {
            val1 += studentsInThisStudentGroupDocuments.length
          }
          if (b.selected) {
            val2 += studentsInThisStudentGroupDocuments.length
          }
          return val1 - val2
        })}
        unselected={unselected}
        selected={selected}
        studentGroupId={studentGroupId}
      />

      <NewStudent
        openAddExistingModalHandler={onOpen}
        studentsRef={studentsRef}
        studentsInStudentGroupsRef={studentsInStudentGroupsRef}
        studentGroupDocument={studentGroupDocument}
        studentGroupId={studentGroupId}
      />

      <AddExistingStudentsModal
        onClose={onClose}
        isOpen={isOpen}
        studentDocuments={studentDocuments}
        studentsInThisStudentGroupDocuments={studentsInThisStudentGroupDocuments}
        studentsInStudentGroupsRef={studentsInStudentGroupsRef}
        studentGroupDocument={studentGroupDocument}
      />

      <FullScreenDisplay
        modalHeadingText="FullScreenMode"
        onClose={() => setFullScreenDisplayIsOpen(false)}
        isOpen={fullScreenDisplayIsOpen}
        selectHandler={selectHandler}
      >
        <NameDisplay
          selectedStudent={selectedStudent}
          isFullScreen
          setFullScreenDisplayIsOpen={setFullScreenDisplayIsOpen}
          selectHandler={selectHandler}
        />
      </FullScreenDisplay>
    </PageContentsBox>
  )
}

export default StudentGroup
