---
layout: post
title: Symbol Table：符号表（映射表）
date: 2019-06-29 11:26
comments: true
external-url:
categories: ['Data Structure']
lang: zh
---


> 本文参考了《算法》这本书


# 一、概述

所谓符号表（Symbol Table），这个名词听起来可能比较陌生，但是对于**键值对**，这个名词大家都不会陌生，符号表其实也就是键值对的另一种表达，而且在不同的编程语言环境，所叫的名词也不相同，比如在`Java`中的叫`Map`，例如常用的`HashTable`和`HashMap`等，在`Python`中就叫做`Dictionary`，但是表达的都是**键值对**这种数据结构。

这种数据结构的主要目的是**将值与一个键关联起来**，支持两种基本的操作：

+ 插入一个key-value对；
+ 根据插入的key，查询对应的value；

这种操作场景简直是司空见惯，比如一个网址的URL对应一个html文档，其中URL是key，html文档是value。还有DNS解析、ARP地址解析等，都可以抽象成符号表这种数据结构。

从另外一个角度来说，就是**泛化的数组**，数组是可以通过索引来查找对应的值的，不过其索引只能是整数，并且被限制在一定的范围内，而符号表则对这两种限制进行了突破，即：

- 索引可以是任意类型；
- 索引的范围范围也是不固定的；


# 二、提供的`API`

这种数据结构有多种不同的实现方式，在此之上需要定义一些抽象层次上的`API`，通常来说包括增删改查等操作，还有一些可以通过这些操作运算得到结果的`API`，包括：

```java
public abstract class ST<K, V>{
    public ST(){}

    // 增加一对键值对
    abstract void put(K key, V value);

    // 删除指定key对应的value
    void delete(K key){
        put(key, null);
    }

    // 获取指定的key对应的value
    abstract V get(K key);

    // 是否存在指定key对应的value
    boolean contains(K key){
        return get(key) != null;
    }

    // 符号表是否为空
    abstract boolean isEmpty();

    // 获取符号表中键值对的数量
    abstract int size();

    // 迭代所有的key
    abstract Iterable<K> keys();
}
```

在声明这些API中，有一些实现上的惯例需要注意一下，比如：

- 要考虑到`null`值：比如对于其中的key不能为`null`，有时候在一些实现中要求value也不能为`null`，另外也要注意存取操作中遇到`null`的处理方法；
  - 对于`get(...)`如果不存在对应key的value，则会返回`null`；
  - 对于`delete(…)`将对应key的value换成`null`即可认为是删除了该值；
- 在符号表中，我们设定其中的key是不会重复的，如果给重复的key赋值则会覆盖之前已经存在的value；


# 三、实现

## 3.1 实现策略

> 这里要说明的实现策略，是从性能和效率等角度考虑的，通过遵守这些策略可以使得对于符号表的实现更好，使之高效运行并避免出现意外的问题，当然，即使你不按照这中策略也是可以实现符号表的，但是不管是从性能方面，还是从避免各种奇葩问题的出现等角度，都不是一个好的选择。

综合来看，这里涉及到的实现策略主要是对于符号表中key的约束。**对于value来说，可以是任意类型的数据，这一点和数组的方式是保持一致的**。


### 3.1.1 key最好为不可变类型

在实现符号表时，为了避免出现不可预知的情况，**最好将其中的key的数据类型锁定为immutable data type**，因为这样可以避免在程序运行的过程中，可以肆意改动符号表中的key，导致整体结构的混乱。

在Java中，除了String数据类型，其他几个基本数据类型的包装类也是不可变类型，可以作为符号表的key，如果要设计自定义类型，最好将其中的属性使用final修饰，明确说明其不可更改的特点。


### 3.1.2 key最好是可比较的

如果key是可以进行比较的，一些基于顺序设计的算法就可以利用起来，帮助更有效率的实现，比如：

- 通过利用key的顺序，可以使得查找对应的value更有效率；
- 这种假设使得对应集合的排序操作非常方便；

要实现key是可以比较的，在Java中一般有两种方式，如下：

- key的数据类型继承[Comparable](https://docs.oracle.com/javase/8/docs/api/java/lang/Comparable.html)；
- 还有一种是通过使用[Comparator](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html)；

有第一种更适合在这里进行说明，所以这里我们主要使用第一种。

> 但是有时候两个key只需进行相等的比较，不需要判断大小，这是另外一种实现的的方法，称之为Hash表，由于其本身的丰富内容，后面会单独进行说明。

对于那种不需要进行大小判断的类型实例，则只需要进行相等性测试，在Java中，基于上面的说明，如果两个对象相等，可以使用`key.compareTo(anotherKey) == 0`来实现，但是还有另一个API不能忽略，需要和这个方法保持一致，即是在`Object`中定义的`equals(...)`，这种方式需要和compareTo(...)保持一致，或者说，在一些只需要测试相等性的场合，我们甚至都不需要实现[Comparable](https://docs.oracle.com/javase/8/docs/api/java/lang/Comparable.html)，只需要实现`equals(...)`这个方法即可。

不管怎样，实现`equals()`是一个基本的要求，对于该方法的一些详细内容，可以参考[JavaDoc](https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html#equals-java.lang.Object-)，对于不同的数据类型，有不同的实现形式：

- 针对默认的情况，直接使用系统提供的实现：

```java
public boolean equals(Object obj) {
	return (this == obj);
}
```

- 对于一些内置的数据类型，比如字符串或者基本乐行的包装类等，使用它们特定化的实现，例如Double类型：

```java
public boolean equals(Object obj) {
    return (obj instanceof Double) && (doubleToLongBits(((Double)obj).value) ==
    	doubleToLongBits(value));
}
```

- 其他还有的就是自定义的数据类型，此时需要一些注意事项：

```java
public final class DefinedType implements Comparable<DefinedType> {
    private final String name;
    private final Date date;

    public DefinedType(String name, Date date){
        this.name = name;
        this.date = date;
    }

    @Override
    public boolean equals(Object obj) {
        if(obj == this) {
            return true;
        }
        if(obj == null){
            return false;
        }
        if(!obj.getClass().equals(this.getClass())){
            return false;
        }
        DefinedType dt = (DefinedType)obj;
        if(!this.name.equals(dt.name)){
            return false;
        }
        if(!this.date.equals(dt.date)){
            return false;
        }
        return this.compareTo(dt) == 0;
    }

    @Override
    public int compareTo(DefinedType o) {
        return this.name.compareTo(o.name);
    }
}
```

从上述自定义的类型中可以观察出几个设计时需要遵守的原则，如下：

1. 类本身和其中的属性都被设置为`final`，以免在使用中被篡改，出现意外情况；
2. 实现equals方法：
	1. 首先检验两者是否指向同一个对象引用；
	2. 然后校验对象是否是null；
	3. 再判断对象是否是同一个类型；
	4. 之后才是对对象所包含的各个属性字段的比较，如果涉及到数组则需要针对其中的每一项进行比较；
3. 对于作为符号表的key，前面提到最好能够`comparable`，因此此时需要`compareTo(...)`和`equals(...)`在实现上保持一致；


## 3.2 实现方式

这里三种实现方式，由于底层使用的数据结构和算法不同，导致它们实现的性能和效率也不同，这些实现方式包括：

- 使用无序链表实现；
- 使用二分查找和有序数组实现；
- 基于hash算法实现的hash表；


### 3.2.1 无序链表实现

使用无序链表来实现符号表时，将每个键值对设为一个链表中的节点，通过这种方式可以将符号表的查询和添加操作转换为链表的查询和添加操作，具体实现如下：

```java
public class LinkedListST<K, V> extends ST<K, V> {
    private Node first;

    @Override
    void put(K key, V value) {
        for (Node x = first; x != null; x = x.next) {
            if (key.equals(x.key)) {
                x.value = value;
                break;
            }
        }
        first = new Node(key, value, first);
    }

    @Override
    V get(K key) {
        for (Node x = first; x != null; x = x.next){
            if (key.equals(x.key)) {
                return x.value;
            }
        }
        return null;
    }

    @Override
    boolean isEmpty() {
        return size() <= 0;
    }

    @Override
    int size() {
        int size = 0;
        for (Node x = first; x != null; x = x.next){
            size++;
        }
        return size;
    }

    @Override
    Iterable<K> keys() {
        List<K> keys = new LinkedList<>();
        for (Node x = first; x != null; x = x.next){
            keys.add(x.key);
        }
        return keys;
    }

    private class Node{
        K key;
        V value;
        Node next;

        public Node(K key, V value, Node next){
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }
}
```

这种实现方式有一些问题，首先察觉到的是这种实现方式是以**顺序搜索**为核心的，即每次进行查询和添加操作都要搜索整个链表，因此，从最坏的情况上看，**每次执行插入和查询的时间复杂度，都有`O(N)`，这在大数据量情况下显然是不可接受的**。


### 3.2.2 二分查找和有序数组实现

这种实现方式的核心思想在于：在上面的方式中是使用顺序搜索的方式完成查询和插入的，但是这种方式效率低下，因此通过**二分查找能够使得查询的时间复杂度能够降到`O(logN)`。**

这里使用并行数组来实现符号表，一个数组用于存储key，一个用于存储value，由于key是可以comparable的，所以可以通过对key进行排序然后存储到数组中，以便后续的二分查找的，另外还**需要考虑的一点是由于数组是有固定的长度的，所以在一定时机需要对数组进行扩容**，具体的实现如下：

```java
public class BinarySearchST<K extends Comparable<K>, V> extends ST<K, V> {
    private K[] keys;
    private V[] values;
    private int N;

    public BinarySearchST(int capacity){
        keys = (K[]) new Comparable[capacity];
        values = (V[]) new Object[capacity];
    }

    @Override
    void put(K key, V value) {
        int i = rank(key);
        // 覆盖旧值
        if(i < N && keys[i].compareTo(key) == 0){
            values[i] = value;
            return;
        }
        // 扩容
        if(N == keys.length) {
            resize(2 * keys.length);
        }
        // 插入新值
        for(int j = N; j> i; j--){
            keys[j] = keys[j-1];
            values[j] = values[j-1];
        }
        keys[i] = key;
        values[i] = value;
        N++;
    }

    @Override
    V get(K key) {
        if(isEmpty()){
            return null;
        }
        int i = rank(key);
        if(i < N && keys[i].compareTo(key) == 0){
            return values[i];
        } else {
            return null;
        }
    }

    @Override
    void delete(K key) {
        if(isEmpty()){
            return;
        }
        int i= rank(key);
        // 删除时，需要待删除的数据后的所有数据都要移动
        if(i < N && keys[i].compareTo(key) == 0){
            for(int j = i; j< N - 1;j++){
                keys[j] = keys[j+1];
                values[j] = values[j+1];
            }
            N--;
            keys[N] = null;
            values[N] = null;

            if(N > 0 && N == keys.length/4){
                resize(keys.length/2);
            }
        }
    }

    @Override
    boolean isEmpty() {
        return size() <= 0;
    }

    @Override
    int size() {
        return N;
    }

    @Override
    Iterable<K> keys() {
        return keys(keys[0], keys[N - 1]);
    }

    /***
     * 使用二分查找的策略来找到key对应的索引
     * @param key 符号表中的key
     * @return 如果找到key对应的索引所返回，否则返回对应的low的索引
     */
    public int rank(K key){
        int low = 0, high = N - 1;
        while(low <= high){
            int middle = low + (high - low)/2;
            int cmp = key.compareTo(keys[middle]);
            if(cmp < 0){
                high = middle - 1;
            } else if(cmp > 0) {
                low = middle + 1;
            } else {
                return middle;
            }
        }
        return low;
    }

    /***
     * 数组扩容或者缩小
     * @param capacity 扩容或者缩小之后的数组
     */
    private void resize(int capacity) {
        keys = Arrays.copyOf(keys, capacity);
        values = Arrays.copyOf(values, capacity);
    }

    /***
     * 返回指定范围的所有的key的集合
     * @param low key的左边界
     * @param high key的右边界
     * @return 返回指定范围对应的key的集合
     */
    public Iterable<K> keys(K low, K high) {
        Queue<K> queue = new LinkedBlockingDeque<>();
        if (low.compareTo(high) > 0) {
            return queue;
        };
        for (int i = rank(low); i < rank(high); i++){
            queue.add(keys[i]);
        }
        if (contains(high)){
            queue.add(keys[rank(high)]);
        }
        return queue;
    }
}
```

这种方式也存在问题，尤其是**当数据量过大时，需要频繁的变动数组的空间容量**。

总的来说，相比于使用无序链表的实现，在**查询时将时间复杂度从`O(N)`降到了`O(logN)`，**但是对于**插入操作，从上述的`put(...)`方法实现中可以看出，在最坏情况下（比如每次都需要移动整个数组），仍然需要进行N次访问，所以其时间复杂度仍然是`O(N)`。**

由于这种实现是有序的，所以其中还可以实现一些有意思的API，如下：

```java
/***
 * 找到最小的key
 * @return
 */
public K min(){
    return keys[0];
}

/***
 * 找到最大的key
 * @return
 */
public K max(){
    return keys[N - 1];
}

/***
 * 找到第k小的key
 * @param k
 * @return
 */
public K select(int k){
    return keys[k];
}

/***
 * 返回符号表中最小的key，该key大于或者等于{@code key}
 * @param key
 * @return
 */
public K ceiling(K key){
    int i = rank(key);
    if(i == N){
        return null;
    }
    return keys[i];
}

/***
 * 返回符号表中最大的key，该key小于或者等于{@code key}
 * @param key
 * @return
 */
public K floor(K key){
    int i = rank(key);
    if(i < N && key.compareTo(keys[i]) == 0){
        return keys[i];
    }
    if(i == N){
        return null;
    } else{
        return keys[N - 1];
    }
}
```


### 3.2.3 Hash表

由于这部分涉及到的内容过于繁杂，后边会单独写一篇进行说明。





