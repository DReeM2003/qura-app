class Node:
   def __init__(self, value, next=None):
       self.value = value
       self.next = next

# For testing
def print_linked_list(head):
    current = head
    while current:
        print(current.value, end=" -> " if current.next else "\n")
        current = current.next


def cycle_length(protein):
    slow = protein
    fast = protein
    cycle = False
    res = []

    while fast:
        slow = slow.next
        fast = fast.next
        if fast:
            fast = fast.next

        if slow == fast:
            cycle = True
            res.append(slow.value)
            slow = slow.next
            break

    if not cycle:
        return False

    while slow.value not in res:
        res.append(slow.value)
        slow = slow.next


    return slow

protein_head = Node('Ala', Node('Gly', Node('Leu', Node('Val'))))
protein_head.next.next.next.next = protein_head.next 

print(cycle_length(protein_head))

















































# def edit_dna_sequence(dna_strand, m, n):
#     curr = dna_strand    

#     while curr:
#         for _ in range(m-1):
#             if curr:
#                 curr = curr.next
        
#         if curr:
#             skip = curr.next
#             for _ in range(n):
#                 if skip:
#                     skip = skip.next

#             curr.next = skip
#             curr = curr.next

#     return dna_strand


# dna_strand = Node(1, Node(2, Node(3, Node(4, Node(5, Node(6, Node(7, Node(8, Node(9, Node(10, Node(11, Node(12, Node(13)))))))))))))

# print_linked_list(edit_dna_sequence(dna_strand, 2, 3))